/**
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */

// tslint:disable-next-line:no-var-requires
const Buffer: typeof global.Buffer = require("buffer").Buffer;
import { Log } from "./tools/log";
import { Crypto } from "./tools/crypto";
import { StringMap } from "./tools/stringmap";
import { VObserver } from "./tools/observer";
import { VObservable } from "./tools/observable";
import { PrivateKey } from "./key";
import { RequestMessage, ResponseOrPushMessage, ProcessRequest, Contract, TxResponseOrPush, TxRequest } from "./api";

/**
 * Are we connected or not?
 * In case of NoDisconnected: reregister for push updates.
 * In case of NoCrashed: reregister for push updates. Also any outstanding requests were canceled. (called back with an error)
 * In case of NoNotSupported: it will not connect again. Also any outstanding requests were canceled. (called back with an error)
 */
export enum Connected { Yes, NoJustStarted, NoDisconnected, NoCrashed, NoNotSupported }

export interface PushMessage {
	type: string;
	data: any;
}

/**
 * The Client is used to interact with the Server.
 * Observe the Client to keep updated about the connection status and incomming push messages.
 */
export class Client extends VObservable<Connected | PushMessage> {
	//Singleton instance
	protected static instance: Client | undefined = undefined;

	//Settings
	protected serviceURL: string | undefined;
	protected processURL: string | undefined;
	protected signPrefix: Buffer | undefined;
	protected signMethod: string = "hash256-ecdsa-compact";
	protected reconnectTimeout: number = 5000;
	protected maxReconnectTimeout: number = 60000;
	protected isInitialized: boolean = false;

	//Websocket information
	protected webSocket: WebSocket | undefined;
	protected connected: Connected = Connected.NoJustStarted;
	protected timeout: number = 5000;
	protected requestResponseMap = new StringMap<{ type: string, data?: {}, resolve: (data: any) => void, reject: (error: Error) => void }>();

	protected constructor() {
		super();
	}

	/** Get this instance. */
	public static get(): Client {
		if (this.instance === undefined) {
			this.instance = new Client();
		}
		return this.instance;
	}

	/**
	 * Initialize this instance. Once it is initialized it will connect to the server.
	 * @param signPrefix The prefix used for signing transactions
	 * @param serviceURL The url of the server for reading.
	 * @param processURL The url of the server for new transactions.
	 * @param signMethod The method used for signing transactions
	 * @param reconnectTimeout The timeout before trying to reconnect should it disconnect.
	 * Note that it is a bit randomized to prevent all client from connecting at the same time after a crash.
	 * @param maxReconnectTimeout It will slowly increase timeout if connecting fails, this is the maximum it is allowed to reach.
	 */
	public init(signPrefix: string, serviceURL: string, processURL: string = serviceURL, signMethod: string = "hash256-ecdsa-compact",
		reconnectTimeout: number = 5000, maxReconnectTimeout: number = 60000): void {

		if (!this.isInitialized) {
			this.isInitialized = true;
			this.serviceURL = serviceURL;
			this.processURL = processURL;
			if (!this.serviceURL.endsWith("/")) {
				this.serviceURL += "/";
			}
			if (!this.processURL.endsWith("/")) {
				this.processURL += "/";
			}
			if (this.processURL !== this.serviceURL && this.processURL!.slice(0, 4) !== "http") {
				throw new Error("processURL should be the same as serviceURL or a http(s) url");
			}
			this.signPrefix = Crypto.utf8ToBinary(signPrefix);
			this.signMethod = signMethod;
			this.reconnectTimeout = reconnectTimeout;
			this.maxReconnectTimeout = maxReconnectTimeout;
			this.createWebsocket();
		}
	}

	/** Get whether there currently is a connection to the backend. 0 = yes, 1+ = no for various reasons. */
	public isConnected(): Connected {
		return this.connected;
	}

	/** Helper to sign data with a private key for contract. */
	protected sign(toSign: Buffer, privateKey: PrivateKey, method?: string): Buffer {
		let result: Buffer;
		//Currently we only support one signing method.
		switch (method) {
			case "hash256-ecdsa-compact":
			default:
				result = privateKey.sign(toSign);
		}
		return result;
	}

	/** Combines the query("contracts"), signAndSend() and getProcessedTx() methods. */
	public async processTx(privateKey: PrivateKey, contractName: string, payload: object, validTill: number = 0): Promise<TxResponseOrPush> {
		//Will throw an error if it failed to retrieve the contracts. (Which we don't catch but directly forward.)
		const contracts = await this.query("contracts", undefined, true);

		//We managed to get the contracts
		for (const contract of contracts) {
			if (contract.type === contractName) {
				if (Object.keys(contract.template).length !== Object.keys(payload).length) {
					throw new Error("Payload not valid for contract.");
				}
				for (const key of Object.keys(contract.template)) {
					if ((payload as any)[key] === undefined) {
						throw new Error("Payload not valid for contract.");
					}
				}
				const id = Crypto.id();
				try {
					await this.signAndSend(privateKey, id, Crypto.hexToBinary(contract.hash), payload, validTill);
					try {
						return await this.getProcessedTx(id);
					} catch (error2) {
						throw new Error(`Transaction delivered, but unable to determine status: ${error2.message}`);
					}
				} catch (error) {
					throw new Error(`Failed to deliver transaction: ${error.message}`);
				}
			}
		}
		throw new Error("Contract does not exist (anymore).");
	}

	/**
	 * Sign a transaction and send it to be processed.
	 * @param privateKey The private key used for signing
	 * @param transactionId Id of the transaction (use Crypto.id() to generate a random one)
	 * @param contractHash Hash of the contract
	 * @param payload A payload json
	 * @param validTill Till when the transaction is valid (milliseconds since unix epoch), 0 = always
	 * Once a block with a processed time greater than this is created it is no longer valid, but as creating
	 * a block takes some time the block it is in may be processed just after the validTill.
	 */
	public async signAndSend(privateKey: PrivateKey, transactionId: Buffer, contractHash: Buffer, payload: object, validTill: number = 0): Promise<void> {
		if (!this.isInitialized) {
			throw new Error("Coinversable is not initialized.");
		}

		const binaryTx = Buffer.concat([
			Crypto.uInt8ToBinary(1), //version
			transactionId,
			contractHash,
			Crypto.uLongToBinary(validTill),
			Crypto.utf8ToBinary(JSON.stringify(payload))
		]);
		const publicKey = privateKey.getPublicKey();
		const signature = this.sign(Buffer.concat([this.signPrefix!, binaryTx]), privateKey, this.signMethod);

		//Create the format request
		const request: ProcessRequest = {
			base64tx: Crypto.binaryToBase64(Buffer.concat([
				Crypto.uInt32ToBinary(binaryTx.length + publicKey.length + signature.length),
				binaryTx,
				signature,
				publicKey
			])),
			createTs: Date.now()
		};
		return this.query("process", request, true);
	}

	/** Get a transaction once it has been processed (which may take a while). */
	public async getProcessedTx(transactionId: Buffer): Promise<TxResponseOrPush> {
		return new Promise<TxResponseOrPush>((resolve, reject) => new Helper(transactionId, resolve, reject));
	}

	/**
	 * Send query to remote service.
	 * @param type The action that you want to perform.
	 * @param data The data to send to the server in this request
	 * @param quickFail Whether to fail if there is no connection or to try again later
	 */
	public async query(type: string, data?: any, quickFail?: boolean): Promise<void>;
	public async query(type: "contracts", data?: undefined, quickFail?: boolean): Promise<Contract[]>;
	public async query(type: "transaction", data: TxRequest, quickFail?: boolean): Promise<TxResponseOrPush | undefined>;
	public async query(type: "txStatus", data: TxRequest, quickFail?: boolean): Promise<string | undefined>;
	public async query(type: "time", data?: undefined, quickFail?: boolean): Promise<number>;
	public async query(type: "process", data: ProcessRequest, quickFail?: boolean): Promise<void>;
	public async query(type: string, data?: any, quickFail: boolean = false): Promise<any> {
		//If we only post a transaction we won't setup a websocket connection, but just send it.
		if (type === "process" && (this.processURL !== this.serviceURL || !this.isInitialized)) {
			if (!this.isInitialized) {
				throw new Error("Coinversable not initialized");
			} else {
				return new Promise((resolve, reject) => {
					const restRequest = new XMLHttpRequest();
					restRequest.onreadystatechange = () => {
						if (restRequest.readyState === 4) {
							if (restRequest.status === 200) {
								resolve(restRequest.responseText);
							} else {
								reject(restRequest.responseText !== "" ? restRequest.responseText : "Failed to connect.");
							}
						}
					};
					restRequest.open("POST", this.processURL! + "process", true);
					restRequest.send(JSON.stringify(data));
				});
			}
		}

		const id: string = Crypto.binaryToHex(Crypto.id());
		const request: RequestMessage = {
			type,
			id
		};

		//If we have data to send along with our request
		if (data !== undefined) {
			request.data = data;
		}

		//If it currently is not connected.
		if (this.webSocket === undefined || this.webSocket.readyState !== WebSocket.OPEN) {
			if (this.connected !== Connected.NoCrashed && this.connected !== Connected.NoNotSupported) {
				if (quickFail) {
					throw new Error("No connection");
				} else {
					//Mark it to be resend once it connects again
					return new Promise((resolve, reject) => this.requestResponseMap.set(id, { type, data, resolve, reject }));
				}
			} else {
				//If there was a crash do not try again, could be our request was responsible for that.
				throw new Error("Connection to backend crashed.");
			}
		}

		const requestString = JSON.stringify(request);
		Log.debug(`Request: ${requestString}`);
		this.webSocket.send(requestString);

		//Await response
		return new Promise((resolve, reject) => this.requestResponseMap.set(id, { type, data, resolve, reject }));
	}

	/** Create a new websocket after initializing or losing connection. */
	protected createWebsocket(): void {
		//Create a websocket
		this.webSocket = new WebSocket(this.serviceURL!);

		//When it opens.
		this.webSocket.onopen = () => {
			//Mark as connected again before resending outstanding requests
			this.connected = Connected.Yes;

			//Resend outstanding requests (in case of a crash they are removed already)
			for (const key of this.requestResponseMap.keys()) {
				const requestMap = this.requestResponseMap.get(key);
				//Resend the message
				this.query(requestMap.type, requestMap.data).then(requestMap.resolve).catch(requestMap.reject);
				//No need to keep multiple, the newly created request will be saved again
				this.requestResponseMap.delete(key);
			}

			//notify observers of new status
			this.setChanged();
			this.notifyObservers(Connected.Yes);
			//Successfully connected, so reset timeout. Random timeout, so we don't all reconnect at the same time.
			this.timeout = this.reconnectTimeout * (0.5 + Math.random());
		};

		//this.webSocket.onerror = (error) => {
		//onclose will be called as well in the event of an error, so we let that deal with reconnecting
		//};

		//When a message is received.
		this.webSocket.onmessage = (message) => {
			let response: ResponseOrPushMessage;
			try {
				response = JSON.parse(message.data);
			} catch (error) {
				Log.warn(`Message data: ${message.data}`);
				Log.error("Received message is not valid json.", error);
				return;
			}

			if (response.id !== undefined) {
				Log.debug(`Response: ${message.data}`);
				const responseMap = this.requestResponseMap.get(response.id);
				if (responseMap !== undefined) {
					if (response.error !== undefined) {
						responseMap.reject(new Error(response.error));
					} else {
						responseMap.resolve(response.data);
					}
					//Remove it from the list of outstanding requests
					this.requestResponseMap.delete(response.id);
				} else {
					Log.warn(`Received response to unknown request: ${message.data}`);
				}
			} else {
				Log.debug(`Push: ${message.data}`);
				if (response.error === undefined && typeof response.pushType === "string") {
					this.setChanged();
					this.notifyObservers({
						type: response.pushType,
						data: response.data
					});
				} else {
					Log.warn(`Received invalid push message: ${message.data}`);
				}
			}
		};

		//When the websocket closes
		this.webSocket.onclose = (ev) => {
			if (ev.code === 1001) {
				Log.info("Server going offline, reconnecting in a moment...");
				this.connected = Connected.NoDisconnected;
				this.setChanged();
			} else if (ev.code === 4100) {
				//Any outstanding requests will be canceled
				for (const requestKey of this.requestResponseMap.keys()) {
					this.requestResponseMap.get(requestKey).reject(new Error("Version of api not supported."));
					this.requestResponseMap.delete(requestKey);
				}
				//Version of the api not supported
				this.connected = Connected.NoNotSupported;
				this.setChanged();
			} else {
				if (this.connected === Connected.Yes) {
					//Log and delete outstanding requests
					for (const requestKey of this.requestResponseMap.keys()) {
						const data = this.requestResponseMap.get(requestKey).data;
						Log.warn(`Outstanding requests: ${requestKey}: type: ${this.requestResponseMap.get(requestKey).type} ` +
							`data: ${data !== undefined ? JSON.stringify(data) : undefined}`);
						this.requestResponseMap.get(requestKey).reject(new Error("Connection to backend crashed."));
						this.requestResponseMap.delete(requestKey);
					}
					Log.error("Error in websocket connection, reconnecting in a moment...");
					this.connected = Connected.NoCrashed;
					this.setChanged();
				} else if (this.connected === Connected.NoJustStarted) {
					Log.info("Failed to connect, trying again in a moment...");
				} else {
					Log.info("Failed to reconnect, trying again in a moment...");
				}
			}

			this.notifyObservers(this.connected);
			//Unless the version of the api is no longer supported try to connect again.
			if (this.connected !== Connected.NoNotSupported) {
				setTimeout(() => this.createWebsocket(), Math.min(this.timeout, this.maxReconnectTimeout));
				this.timeout *= 1.5; //Increase timeout so we don't retry to often.
			}
		};
	}
}

/** Helper class to wait till a transaction has been processed before calling the callback. */
class Helper implements VObserver<Connected | PushMessage> {
	private readonly id: string;
	private readonly resolve: (tx: TxResponseOrPush) => void;
	private readonly reject: (error: Error) => void;

	constructor(id: Buffer, resolve: (tx: TxResponseOrPush) => void, reject: (error: Error) => void) {
		this.id = Crypto.binaryToHex(id);
		this.resolve = resolve;
		this.reject = reject;
		Client.get().addObserver(this);
		Client.get().query("transaction", { txId: this.id, push: true }, true).then((data) => {
			//No known status, wait for push transaction instead
			if (data !== undefined) {
				Client.get().deleteObserver(this);
				this.resolve(data);
			}
		}).catch((error) => {
			this.reject(error);
		});
	}

	public update(_: Client, arg?: Connected | PushMessage): void {
		if (typeof arg === "object" && arg.type === "transaction" && (arg.data as TxResponseOrPush).id === this.id) {
			Client.get().deleteObserver(this);
			this.resolve(arg.data as TxResponseOrPush);
		} else if (arg === Connected.Yes) {
			//Reregister for push updates
			Client.get().query("transaction", { txId: this.id, push: true }, true).then((data) => {
				//No known status, wait for push transaction instead
				if (data !== undefined) {
					Client.get().deleteObserver(this);
					this.resolve(data);
				}
			}).catch((error) => {
				this.reject(error);
			});
		}
	}
}