/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */

// tslint:disable:no-var-requires
const Buffer: typeof global.Buffer = require("buffer").Buffer;
const EventEmitter: typeof NodeJS.EventEmitter = require("events").EventEmitter;
const WebSocket: any = typeof window === "undefined" ? require("ws") : (window as any).WebSocket;
import { Log } from "./tools/log";
import { Crypto } from "./tools/crypto";
import { VObserver } from "./tools/observer";
import { PrivateKey } from "./key";
import { RequestMessage, ResponseOrPushMessage, ProcessRequest, Contract, TxResponseOrPush, TxRequest } from "./api";

/**
 * Are we connected or not?
 * In case of NoDisconnected: reregister for push updates.
 * In case of NoCrashed: reregister for push updates. Also any outstanding requests were canceled. (called back with an error)
 * In case of NoNotSupported or NoClosed: it will not connect again. Also any outstanding requests were canceled. (called back with an error)
 */
export enum Connected { Yes, NoJustStarted, NoDisconnected, NoCrashed, NoNotSupported, NoClosed }

/**
 * The push message that will be send.
 * @deprecated Make use of the new on(event) instead.
 */
export interface PushMessage {
	type: string;
	data: any;
}

/**
 * The Client is used to interact with the Server.
 * Observe the Client to keep updated about the connection status and incoming push messages.
 */
export class Client extends EventEmitter {
	//Singleton instance
	protected static instance: Client | undefined = undefined;

	private static deprecatedAddObserverWarning: boolean = false;
	private static deprecatedNotifyObserversWarning: boolean = false;
	private static depricatedInitWarning: boolean = false;
	private static depricatedSignWarning: boolean = false;

	//Settings
	protected serviceURL: string | undefined;
	protected signPrefix: Buffer | undefined;
	protected reconnectTimeout: number = 5000;
	protected maxReconnectTimeout: number = 60000;
	protected isInitialized: boolean = false;
	protected initPromise: Promise<void> | undefined;
	protected initResolve: (() => void) | undefined;

	//Websocket information
	protected webSocket: WebSocket | undefined;
	protected connected: Connected = Connected.NoJustStarted;
	protected timeout: number = 5000;
	protected requestResponseMap = new Map<string, { resolve: (data: any) => void, reject: (error: Error) => void, error: Error, type: string, data: any }>();
	protected transactionPushMap = new Map<string, { resolve: (data: any) => void, reject: (error: Error) => void, error: Error, promise: Promise<TxResponseOrPush> }>();

	protected constructor() {
		super();
		this.setMaxListeners(0);
	}

	/** Get this instance. Using forceNew it is possible to create a new client, but this will not remove the old one! */
	public static get(forceNew: boolean = false): Client {
		if (forceNew) {
			return new Client();
		}
		if (Client.instance === undefined) {
			Client.instance = new Client();
		}
		return Client.instance;
	}

	/**
	 * Initialize this instance. Once it is initialized it will connect to the server.
	 * When awaited it will not return till it has connected to the server for the first time (which takes forever if server is offline!)
	 * @param signPrefix The prefix used for signing transactions
	 * @param serviceURL The url of the server for reading.
	 * @param reconnectTimeout The timeout before trying to reconnect should it disconnect.
	 * Note that it is a bit randomized to prevent all client from connecting at the same time after a crash.
	 * @param maxReconnectTimeout It will slowly increase timeout if connecting fails, this is the maximum it is allowed to reach.
	 */
	public init(signPrefix: string, serviceURL: string, reconnectTimeout?: number, maxReconnectTimeout?: number): Promise<void>;
	/** @deprecated processURL and signMethod are no longer supported. Simply create a second client to use a different process url. */
	public init(signPrefix: string, serviceURL: string, processURL?: string,
		signMethod?: string, reconnectTimeout?: number, maxReconnectTimeout?: number): Promise<void>;
	public init(signPrefix: string, serviceURL: string, reconnectTimeout: number | string = 5000, maxReconnectTimeout: number | string = 60000): Promise<void> {

		if (arguments.length > 4 || typeof reconnectTimeout === "string" || typeof maxReconnectTimeout === "string") {
			if (!Client.depricatedInitWarning) {
				Client.depricatedInitWarning = true;
				Log.warn("Client init no longer supports processURL or sign method. " +
					"Old function call signature will be removed next version.", new Error("Depricated"));
			}
			//In case the user actually made use of processURL throw an error directly so it is clear why it does not work.
			if (typeof reconnectTimeout === "string" && reconnectTimeout !== serviceURL) {
				throw new Error("Client init no longer supports processURL.");
			}
			reconnectTimeout = arguments[4] === undefined ? 5000 : arguments[4];
			maxReconnectTimeout = arguments[5] === undefined ? 60000 : arguments[5];
		}

		if (this.initPromise === undefined) {
			this.isInitialized = true;
			this.initPromise = new Promise((resolve) => this.initResolve = resolve);
			this.serviceURL = serviceURL;
			if (!this.serviceURL.endsWith("/")) {
				this.serviceURL += "/";
			}
			this.signPrefix = Crypto.utf8ToBinary(signPrefix);
			this.reconnectTimeout = reconnectTimeout as number;
			this.maxReconnectTimeout = maxReconnectTimeout as number;
			this.createWebsocket();
		}

		return this.initPromise;
	}

	/** Get whether there currently is a connection to the server. 0 = yes, 1+ = no for various reasons. */
	public isConnected(): Connected {
		return this.connected;
	}

	/**
	 * Helper to sign data with a private key for contract.
	 * @deprecated use PrivateKey.sign() instead.
	 */
	protected sign(toSign: Buffer, privateKey: PrivateKey): Buffer {
		if (!Client.depricatedSignWarning) {
			Client.depricatedSignWarning = true;
			Log.warn("Client.sign() is now deprecated. Use PrivateKey.sign() instead. This function will be removed next version.", new Error("Deprecated"));
		}
		return privateKey.sign(toSign);
	}

	/**
	 * Combines the query("contracts"), signAndSend() and getProcessedTx() methods.
	 * @param privateKey The private key used for signing
	 * @param contractName The name of the contract. Latest version of the contract will be used
	 * @param payload A payload json
	 * @param validTill Till when the transaction is valid (milliseconds since unix epoch), 0 = always
	 * Once a block with a processed time greater than this is created it is no longer valid, but as creating
	 * a block takes some time the block it is in may be processed just after the validTill.
	 * @param quickFail Whether to fail if there is no connection or to try again later
	 * @throws if the contract does not exist, the payload is invalid, there are problems
	 *  with the internet connection or the client is not (correctly) initialized
	 */
	public async processTx(privateKey: PrivateKey, contractName: string,
		payload: { [key: string]: any }, validTill: number = Date.now() + 900000, quickFail = false): Promise<TxResponseOrPush> {

		//Will throw an error if it failed to retrieve the contracts. (Which we don't catch but directly forward.)
		const contracts = await this.query("contracts", contractName, quickFail);

		//Filter to right name and pick latest version
		const contract: Contract | undefined = contracts.filter((aContract) => aContract.type === contractName).sort((a, b) => {
			const versionA = a.version.split(".").map((num) => parseInt(num, 10));
			const versionB = b.version.split(".").map((num) => parseInt(num, 10));
			for (let i = 0; i < versionA.length; i++) {
				if (versionB.length <= i || versionA[i] > versionB[i]) {
					return -1;
				} else if (versionB[i] > versionA[i]) {
					return 1;
				}
			}
			return 1;
		})[0];

		//We managed to get the contracts, check if the one we want exists
		if (contract === undefined) {
			throw new Error("Contract does not exist (anymore).");
		} else {
			for (const key of Object.keys(payload)) {
				if (contract.template[key] === undefined) {
					throw new Error(`Payload not valid for contract, extra key: ${key}.`);
				}
			}
			for (const key of Object.keys(contract.template)) {
				if ((payload as any)[key] === undefined && !contract.template[key].type.endsWith("?")) {
					throw new Error(`Payload not valid for contract, missing key: ${key}.`);
				}
			}
			const id = Crypto.id();
			try {
				await this.signAndSend(privateKey, id, Crypto.hexToBinary(contract.hash), payload, validTill, quickFail);
			} catch (error) {
				throw new Error(`Failed to deliver transaction: ${error.message}`);
			}
			try {
				return await this.getProcessedTx(id);
			} catch (error2) {
				throw new Error(`Transaction delivered, but unable to determine status: ${error2.message}`);
			}
		}
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
	 * @param quickFail Whether to fail if there is no connection or to try again later
	 * @throws if there are problems with the internet connection or the client is not (correctly) initialized
	 */
	public async signAndSend(privateKey: PrivateKey, transactionId: Buffer, contractHash: Buffer,
		payload: { [key: string]: any }, validTill: number = Date.now() + 900000, quickFail = false): Promise<void> {

		if (!this.isInitialized) {
			throw new Error("Client is not initialized.");
		}

		const binaryTx = Buffer.concat([
			Crypto.uInt8ToBinary(1), //version
			transactionId,
			contractHash,
			Crypto.uLongToBinary(validTill),
			Crypto.utf8ToBinary(JSON.stringify(payload))
		]);
		const signature = privateKey.sign(Buffer.concat([this.signPrefix!, binaryTx]));

		//Create the format request
		const request: ProcessRequest = {
			base64tx: Crypto.binaryToBase64(Buffer.concat([
				Crypto.uInt32ToBinary(binaryTx.length + privateKey.publicKey.length + signature.length),
				binaryTx,
				signature,
				privateKey.publicKey
			])),
			createTs: Date.now()
		};
		return this.query("process", request, quickFail);
	}

	/**
	 * Get a transaction once it has been processed (which may take a while).
	 * @throws if there are problems with the internet connection or the client is not (correctly) initialized
	 */
	public async getProcessedTx(transactionId: Buffer): Promise<TxResponseOrPush> {
		const hexTransactionId = Crypto.binaryToHex(transactionId);
		const txPush = this.transactionPushMap.get(hexTransactionId);
		if (txPush !== undefined) {
			return txPush.promise;
		}

		const promise = new Promise<TxResponseOrPush>(async (resolve, reject) => {
			try {
				const data = await this.query("transaction", { txId: hexTransactionId, push: true, wait: true }, false);
				//No known status, wait for push transaction instead
				if (data !== undefined) {
					resolve(data);
				} else {
					this.transactionPushMap.set(hexTransactionId, { resolve, reject, promise, error: new Error() });
				}
			} catch (error) {
				reject(error);
			}
		});

		return promise;
	}

	/**
	 * Send query to remote service.
	 * @param type The action that you want to perform.
	 * @param data The data to send to the server in this request
	 * @param quickFail Whether to fail if there is no connection or to try again later
	 * @throws if there are problems with the internet connection, the client is not (correctly) initialized or an invalid query is performed
	 */
	public async query(type: string, data?: any, quickFail?: boolean): Promise<any>;
	public async query(type: "contracts", data?: string, quickFail?: boolean): Promise<Contract[]>;
	public async query(type: "transaction", data: TxRequest, quickFail?: boolean): Promise<TxResponseOrPush | undefined>;
	public async query(type: "txStatus", data: TxRequest, quickFail?: boolean): Promise<string | undefined>;
	public async query(type: "time", data?: undefined, quickFail?: boolean): Promise<number>;
	public async query(type: string, data?: any, quickFail: boolean = false): Promise<any> {
		const id: string = Crypto.binaryToHex(Crypto.id());
		const request: RequestMessage = { type, id, data };

		//If it currently is not connected.
		if (this.webSocket === undefined || this.webSocket.readyState !== WebSocket.OPEN) {
			if (this.connected === Connected.NoNotSupported || this.connected === Connected.NoClosed) {
				throw new Error("Connection permanently closed.");
			} else if (quickFail) {
				throw new Error("[-4] No connection");
			} else {
				//Mark it to be resend once it connects again
				return new Promise((resolve, reject) => this.requestResponseMap.set(id, { type, data, resolve, reject, error: new Error() }));
			}
		}

		const requestString = JSON.stringify(request);
		Log.debug(`Request: ${requestString}`);
		this.webSocket.send(requestString);

		//We create the error object now so there is a good stacktrace if something goes wrong.
		return new Promise((resolve, reject) => this.requestResponseMap.set(id, { type, data, resolve, reject, error: new Error() }));
	}

	/** Create a new websocket after initializing or losing connection. */
	protected createWebsocket(): void {
		if (this.connected === Connected.NoNotSupported || this.connected === Connected.NoClosed) {
			return;
		}

		//Create a websocket
		this.webSocket = new WebSocket(this.serviceURL!) as WebSocket;

		//When it opens.
		this.webSocket.onopen = () => {
			Log.debug("Websocket connected.");
			//Mark as connected again before resending outstanding requests
			this.connected = Connected.Yes;
			//First time we connect we resolve the init promise (if it exists)
			if (this.initResolve !== undefined) {
				this.initResolve();
				this.initResolve = undefined;
			}

			//Resend outstanding requests (in case of a crash they are removed already). Use Array.from so they don't get added to the iterator
			for (const key of Array.from(this.requestResponseMap.keys())) {
				const requestMap = this.requestResponseMap.get(key)!;
				//Resend the message
				this.query(requestMap.type, requestMap.data).then(requestMap.resolve).catch(requestMap.reject);
				//No need to keep multiple, the newly created request will be saved again
				this.requestResponseMap.delete(key);
			}

			//notify observers of new status
			this.emit("connection", Connected.Yes);
			//Successfully connected, so reset timeout. Random timeout, so we don't all reconnect at the same time.
			this.timeout = this.reconnectTimeout * (0.5 + Math.random());
		};

		this.webSocket.onerror = () => {
			//onclose will be called as well in the event of an error, so we let that deal with reconnecting.
			//Do not bother logging the error message. Due to browser security we never get anything useful.
		};

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
						let error = responseMap.error;
						try {
							error.message = `[${response.status}] ${response.error}`;
						} catch (e) { //Some version of iOS seem to have readonly error.message
							error = new Error(`[${response.status}] ${response.error}`);
						}
						responseMap.reject(error);
					} else {
						responseMap.resolve(response.data);
					}
					//Remove it from the list of outstanding requests
					this.requestResponseMap.delete(response.id);
				} else {
					Log.error(`Received response to unknown request: ${message.data}`);
				}
			} else {
				Log.debug(`Push: ${message.data}`);
				if (response.error === undefined && typeof response.pushType === "string") {
					if (response.pushType === "transaction") {
						const pushResponse = this.transactionPushMap.get((response.data as TxResponseOrPush).id);
						if (pushResponse !== undefined) {
							pushResponse.resolve(response.data);
						}
					}

					this.emit(response.pushType, response.data);
					/** @deprecated To make it backwards compatible. */
					this.emit("deprecatedMessage", { type: response.pushType, data: response.data, status: response.status });
				} else {
					Log.error(`Received invalid push message: ${message.data}`);
				}
			}
		};

		//When the websocket closes
		this.webSocket.onclose = (ev) => {
			if (ev.code === 1000) {
				Log.info("User closed websocket connection, not reconnecting.");
				this.connected = Connected.NoClosed;
				for (const requestKey of this.requestResponseMap.keys()) {
					this.requestResponseMap.get(requestKey)!.reject(new Error("[-1] Connection closed by user."));
					this.requestResponseMap.delete(requestKey);
				}
				this.emit("connection", this.connected);
			} else if (ev.code === 1001) {
				Log.info("Server going offline, reconnecting in a moment...");
				this.connected = Connected.NoDisconnected;
				this.emit("connection", this.connected);
			} else if (ev.code === 4100) {
				//Any outstanding requests will be canceled
				for (const requestKey of this.requestResponseMap.keys()) {
					this.requestResponseMap.get(requestKey)!.reject(new Error("[-2] Version of api not supported."));
					this.requestResponseMap.delete(requestKey);
				}
				//Version of the api not supported
				this.connected = Connected.NoNotSupported;
				this.emit("connection", this.connected);
			} else {
				if (this.connected === Connected.Yes) {
					this.connected = Connected.NoCrashed;
					//Log and delete outstanding requests
					for (const requestKey of this.requestResponseMap.keys()) {
						const resp = this.requestResponseMap.get(requestKey)!;
						Log.warn(`Outstanding requests: ${requestKey}: type: ${resp.type}`);
						resp.reject(new Error("[-3] Connection to server lost."));
						this.requestResponseMap.delete(requestKey);
					}
					Log.warn("Websocket connection lost, reconnecting in a moment...");
					this.emit("connection", this.connected);
				} else if (this.connected === Connected.NoJustStarted) {
					Log.info("Failed to connect, trying again in a moment...");
				} else {
					Log.info("Failed to reconnect, trying again in a moment...");
				}
			}

			setTimeout(() => this.createWebsocket(), Math.min(this.timeout, this.maxReconnectTimeout));
			this.timeout *= 1.5; //Increase timeout so we don't retry to often.
		};
	}

	/** Permanently close the websocket connection. */
	public closeWebsocket(): void {
		if (this.webSocket === undefined) {
			this.connected = Connected.NoClosed;
			this.emit("connected", this.connected);
		} else {
			this.webSocket.close(1000, "User closed websocket.");
		}
	}

	/** Subscribe for connects and disconnects. */
	public on(event: "connection", listener: (connected: Connected) => void): this;
	/** Used for getProcessedTx() and processTx() for old servers. */
	public on(pushType: "transaction", listener: (transaction: TxResponseOrPush) => void): this;
	/** Subscribe for push transactions of a certain type. */
	public on(pushType: string, listener: (data: any) => void): this;
	public on(event: string, listener: (data: any) => void): this {
		return super.on(event, listener);
	}

	/** @deprecated Use on(event) instead. */
	public addObserver(o: VObserver<PushMessage | Connected> | ((arg?: PushMessage | Connected) => void)): void {
		if (!Client.deprecatedAddObserverWarning) {
			Client.deprecatedAddObserverWarning = true;
			Log.warn("addObserver() is now deprecated. Use on(event) instead. This function will be removed next version.", new Error("Deprecated"));
		}
		if (typeof o === "function") {
			this.on("connection", o);
			this.on("deprecatedMessage", o);
		} else if (this.listeners("deprecatedMessage").indexOf(o.update) === -1) {
			this.on("connection", (arg) => o.update(this, arg));
			this.on("deprecatedMessage", (arg) => o.update(this, arg));
		}
	}
	/** @deprecated Use emit(event, data) instead. */
	public notifyObservers(arg?: PushMessage | Connected): void {
		if (!Client.deprecatedNotifyObserversWarning) {
			Client.deprecatedNotifyObserversWarning = true;
			Log.warn("notifyObservers() is now deprecated. Use emit(event) instead. This function will be removed next version.", new Error("Deprecated"));
		}
		this.emit("connection", arg);
		this.emit("deprecatedMessage", arg);
	}
	/** @deprecated Use listeners(event).indexOf() instead. */
	public hasObserver(o: VObserver<PushMessage | Connected>): boolean { return this.listeners("deprecatedMessage").indexOf(o.update) !== -1; }
	/** @deprecated Use listenerCount(event) instead. */
	public countObservers(): number { return this.listenerCount("deprecatedMessage"); }
	/** @deprecated Use listenerCount(event) instead. */
	public countCallbacks(): number { return this.listenerCount("deprecatedMessage"); }
	/** @deprecated Use removeListener(event) instead. */
	public deleteObserver(o: VObserver<PushMessage | Connected>): void { this.removeListener("connection", o.update); this.removeListener("deprecatedMessage", o.update); }
	/** @deprecated No longer available. */
	public hasChanged(): boolean { return false; }
}