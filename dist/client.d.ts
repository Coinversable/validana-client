/**
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
/// <reference types="node" />
import { StringMap } from "./tools/stringmap";
import { VObservable } from "./tools/observable";
import { PrivateKey } from "./key";
import { ProcessRequest, Contract, TxResponseOrPush, TxRequest } from "./api";
/**
 * Are we connected or not?
 * In case of NoDisconnected: reregister for push updates.
 * In case of NoCrashed: reregister for push updates. Also any outstanding requests were canceled. (called back with an error)
 * In case of NoNotSupported: it will not connect again. Also any outstanding requests were canceled. (called back with an error)
 */
export declare enum Connected {
    Yes = 0,
    NoJustStarted = 1,
    NoDisconnected = 2,
    NoCrashed = 3,
    NoNotSupported = 4
}
export interface PushMessage {
    type: string;
    data: any;
}
/**
 * The Client is used to interact with the Server.
 * Observe the Client to keep updated about the connection status and incomming push messages.
 */
export declare class Client extends VObservable<Connected | PushMessage> {
    protected static instance: Client | undefined;
    protected serviceURL: string | undefined;
    protected processURL: string | undefined;
    protected signPrefix: Buffer | undefined;
    protected signMethod: string;
    protected reconnectTimeout: number;
    protected maxReconnectTimeout: number;
    protected isInitialized: boolean;
    protected webSocket: WebSocket | undefined;
    protected connected: Connected;
    protected timeout: number;
    protected requestResponseMap: StringMap<{
        type: string;
        data?: {};
        resolve: (data: any) => void;
        reject: (error: Error) => void;
    }>;
    protected constructor();
    /** Get this instance. */
    static get(): Client;
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
    init(signPrefix: string, serviceURL: string, processURL?: string, signMethod?: string, reconnectTimeout?: number, maxReconnectTimeout?: number): void;
    /** Get whether there currently is a connection to the backend. 0 = yes, 1+ = no for various reasons. */
    isConnected(): Connected;
    /** Helper to sign data with a private key for contract. */
    protected sign(toSign: Buffer, privateKey: PrivateKey, method?: string): Buffer;
    /** Combines the query("contracts"), signAndSend() and getProcessedTx() methods. */
    processTx(privateKey: PrivateKey, contractName: string, payload: object, validTill?: number): Promise<TxResponseOrPush>;
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
    signAndSend(privateKey: PrivateKey, transactionId: Buffer, contractHash: Buffer, payload: object, validTill?: number): Promise<void>;
    /** Get a transaction once it has been processed (which may take a while). */
    getProcessedTx(transactionId: Buffer): Promise<TxResponseOrPush>;
    /**
     * Send query to remote service.
     * @param type The action that you want to perform.
     * @param data The data to send to the server in this request
     * @param quickFail Whether to fail if there is no connection or to try again later
     */
    query(type: string, data?: any, quickFail?: boolean): Promise<void>;
    query(type: "contracts", data?: undefined, quickFail?: boolean): Promise<Contract[]>;
    query(type: "transaction", data: TxRequest, quickFail?: boolean): Promise<TxResponseOrPush | undefined>;
    query(type: "txStatus", data: TxRequest, quickFail?: boolean): Promise<string | undefined>;
    query(type: "time", data?: undefined, quickFail?: boolean): Promise<number>;
    query(type: "process", data: ProcessRequest, quickFail?: boolean): Promise<void>;
    /** Create a new websocket after initializing or losing connection. */
    protected createWebsocket(): void;
}
