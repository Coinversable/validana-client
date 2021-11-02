/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
/// <reference types="node" />
import { EventEmitter } from "events";
import { Buffer } from "buffer";
import { VObserver } from "./tools/observer";
import { PrivateKey } from "./key";
import { Contract, TxResponseOrPush, TxRequest } from "./api";
/**
 * Are we connected or not?
 * In case of NoDisconnected: reregister for push updates.
 * In case of NoCrashed: reregister for push updates. Also any outstanding requests were canceled. (called back with an error)
 * In case of NoNotSupported or NoClosed: it will not connect again. Also any outstanding requests were canceled. (called back with an error)
 */
export declare enum Connected {
    Yes = 0,
    NoJustStarted = 1,
    NoDisconnected = 2,
    NoCrashed = 3,
    NoNotSupported = 4,
    NoClosed = 5
}
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
export declare class Client extends EventEmitter {
    protected static instance: Client | undefined;
    private static deprecatedAddObserverWarning;
    private static deprecatedNotifyObserversWarning;
    private static depricatedInitWarning;
    private static depricatedSignWarning;
    protected serviceURL: string | undefined;
    protected signPrefix: Buffer | undefined;
    protected reconnectTimeout: number;
    protected maxReconnectTimeout: number;
    protected isInitialized: boolean;
    protected initPromise: Promise<void> | undefined;
    protected initResolve: (() => void) | undefined;
    protected webSocket: WebSocket | undefined;
    protected connected: Connected;
    protected timeout: number;
    protected requestResponseMap: Map<string, {
        resolve: (data: any) => void;
        reject: (error: Error) => void;
        error: Error;
        type: string;
        data: any;
    }>;
    protected transactionPushMap: Map<string, {
        resolve: (data: any) => void;
        reject: (error: Error) => void;
        error: Error;
        promise: Promise<TxResponseOrPush>;
    }>;
    protected constructor();
    /** Get this instance. Using forceNew it is possible to create a new client, but this will not remove the old one! */
    static get(forceNew?: boolean): Client;
    /**
     * Initialize this instance. Once it is initialized it will connect to the server.
     * When awaited it will not return till it has connected to the server for the first time (which takes forever if server is offline!)
     * @param signPrefix The prefix used for signing transactions
     * @param serviceURL The url of the server for reading.
     * @param reconnectTimeout The timeout before trying to reconnect should it disconnect.
     * Note that it is a bit randomized to prevent all client from connecting at the same time after a crash.
     * @param maxReconnectTimeout It will slowly increase timeout if connecting fails, this is the maximum it is allowed to reach.
     */
    init(signPrefix: string, serviceURL: string, reconnectTimeout?: number, maxReconnectTimeout?: number): Promise<void>;
    /** @deprecated processURL and signMethod are no longer supported. Simply create a second client to use a different process url. */
    init(signPrefix: string, serviceURL: string, processURL?: string, signMethod?: string, reconnectTimeout?: number, maxReconnectTimeout?: number): Promise<void>;
    /** @deprecated Replaced with connectionStatus() for a less confusion name. */
    isConnected(): Connected;
    /** Get the current connection status. 0 = connected, 1+ = not connected for various reasons. */
    connectionStatus(): Connected;
    /**
     * Helper to sign data with a private key for contract.
     * @deprecated use PrivateKey.sign() instead.
     */
    protected sign(toSign: Buffer, privateKey: PrivateKey): Buffer;
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
    processTx(privateKey: PrivateKey, contractName: string, payload: {
        [key: string]: any;
    }, validTill?: number, quickFail?: boolean): Promise<TxResponseOrPush>;
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
    signAndSend(privateKey: PrivateKey, transactionId: Buffer, contractHash: Buffer, payload: {
        [key: string]: any;
    }, validTill?: number, quickFail?: boolean): Promise<TxResponseOrPush | undefined>;
    /**
     * Get a transaction once it has been processed (which may take a while).
     * @throws if there are problems with the internet connection or the client is not (correctly) initialized
     */
    getProcessedTx(transactionId: Buffer): Promise<TxResponseOrPush>;
    /**
     * Send query to remote service.
     * @param type The action that you want to perform.
     * @param data The data to send to the server in this request
     * @param quickFail Whether to fail if there is no connection or to try again later
     * @throws if there are problems with the internet connection, the client is not (correctly) initialized or an invalid query is performed
     */
    query(type: string, data?: any, quickFail?: boolean): Promise<any>;
    query(type: "contracts", data?: string, quickFail?: boolean): Promise<Contract[]>;
    query(type: "transaction", data: TxRequest, quickFail?: boolean): Promise<TxResponseOrPush | undefined>;
    query(type: "txStatus", data: TxRequest, quickFail?: boolean): Promise<string | undefined>;
    query(type: "time", data?: undefined, quickFail?: boolean): Promise<number>;
    /** Create a new websocket after initializing or losing connection. */
    protected createWebsocket(): void;
    /** Permanently close the websocket connection. */
    closeWebsocket(): void;
    /** Subscribe for connects and disconnects. */
    on(event: "connection", listener: (connected: Connected) => void): this;
    /** Used for getProcessedTx() and processTx() for old servers. */
    on(pushType: "transaction", listener: (transaction: TxResponseOrPush) => void): this;
    /** Subscribe for push transactions of a certain type. */
    on(pushType: string, listener: (data: any) => void): this;
    /** @deprecated Use on(event) instead. */
    addObserver(o: VObserver<PushMessage | Connected> | ((arg?: PushMessage | Connected) => void)): void;
    /** @deprecated Use emit(event, data) instead. */
    notifyObservers(arg?: PushMessage | Connected): void;
    /** @deprecated Use listeners(event).indexOf() instead. */
    hasObserver(o: VObserver<PushMessage | Connected>): boolean;
    /** @deprecated Use listenerCount(event) instead. */
    countObservers(): number;
    /** @deprecated Use listenerCount(event) instead. */
    countCallbacks(): number;
    /** @deprecated Use removeListener(event) instead. */
    deleteObserver(o: VObserver<PushMessage | Connected>): void;
    /** @deprecated No longer available. */
    hasChanged(): boolean;
}
