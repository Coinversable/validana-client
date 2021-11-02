"use strict";
/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = exports.Connected = void 0;
const WebSocket = typeof window === "undefined" ? require("ws") : window.WebSocket;
const events_1 = require("events");
const buffer_1 = require("buffer");
const log_1 = require("./tools/log");
const crypto_1 = require("./tools/crypto");
var Connected;
(function (Connected) {
    Connected[Connected["Yes"] = 0] = "Yes";
    Connected[Connected["NoJustStarted"] = 1] = "NoJustStarted";
    Connected[Connected["NoDisconnected"] = 2] = "NoDisconnected";
    Connected[Connected["NoCrashed"] = 3] = "NoCrashed";
    Connected[Connected["NoNotSupported"] = 4] = "NoNotSupported";
    Connected[Connected["NoClosed"] = 5] = "NoClosed";
})(Connected = exports.Connected || (exports.Connected = {}));
class Client extends events_1.EventEmitter {
    constructor() {
        super();
        this.reconnectTimeout = 5000;
        this.maxReconnectTimeout = 60000;
        this.isInitialized = false;
        this.connected = Connected.NoJustStarted;
        this.timeout = 5000;
        this.requestResponseMap = new Map();
        this.transactionPushMap = new Map();
        this.setMaxListeners(0);
    }
    static get(forceNew = false) {
        if (forceNew) {
            return new Client();
        }
        if (Client.instance === undefined) {
            Client.instance = new Client();
        }
        return Client.instance;
    }
    init(signPrefix, serviceURL, reconnectTimeout = 5000, maxReconnectTimeout = 60000) {
        if (arguments.length > 4 || typeof reconnectTimeout === "string" || typeof maxReconnectTimeout === "string") {
            if (!Client.depricatedInitWarning) {
                Client.depricatedInitWarning = true;
                log_1.Log.warn("Client init no longer supports processURL or sign method. " +
                    "Old function call signature will be removed next version.", new Error("Depricated"));
            }
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
            this.signPrefix = crypto_1.Crypto.utf8ToBinary(signPrefix);
            this.reconnectTimeout = reconnectTimeout;
            this.maxReconnectTimeout = maxReconnectTimeout;
            this.createWebsocket();
        }
        return this.initPromise;
    }
    isConnected() {
        return this.connected;
    }
    connectionStatus() {
        return this.connected;
    }
    sign(toSign, privateKey) {
        if (!Client.depricatedSignWarning) {
            Client.depricatedSignWarning = true;
            log_1.Log.warn("Client.sign() is now deprecated. Use PrivateKey.sign() instead. This function will be removed next version.", new Error("Deprecated"));
        }
        return privateKey.sign(toSign);
    }
    processTx(privateKey, contractName, payload, validTill = Date.now() + 900000, quickFail = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const contracts = yield this.query("contracts", contractName, quickFail);
            const contract = contracts.filter((aContract) => aContract.type === contractName).sort((a, b) => {
                const versionA = a.version.split(".").map((num) => parseInt(num, 10));
                const versionB = b.version.split(".").map((num) => parseInt(num, 10));
                for (let i = 0; i < versionA.length; i++) {
                    if (versionB.length <= i || versionA[i] > versionB[i]) {
                        return -1;
                    }
                    else if (versionB[i] > versionA[i]) {
                        return 1;
                    }
                }
                return 1;
            })[0];
            if (contract === undefined) {
                throw new Error("Contract does not exist (anymore).");
            }
            else {
                for (const key of Object.keys(payload)) {
                    if (contract.template[key] === undefined) {
                        throw new Error(`Payload not valid for contract, extra key: ${key}.`);
                    }
                }
                for (const key of Object.keys(contract.template)) {
                    if (payload[key] === undefined && !contract.template[key].type.endsWith("?")) {
                        throw new Error(`Payload not valid for contract, missing key: ${key}.`);
                    }
                }
                const id = crypto_1.Crypto.id();
                try {
                    const result = yield this.signAndSend(privateKey, id, crypto_1.Crypto.hexToBinary(contract.hash), payload, validTill, quickFail);
                    if (result !== undefined) {
                        return result;
                    }
                }
                catch (error) {
                    throw new Error(`Failed to deliver transaction: ${error.message}`);
                }
                try {
                    return yield this.getProcessedTx(id);
                }
                catch (error2) {
                    throw new Error(`Transaction delivered, but unable to determine status: ${error2.message}`);
                }
            }
        });
    }
    signAndSend(privateKey, transactionId, contractHash, payload, validTill = Date.now() + 900000, quickFail = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isInitialized) {
                throw new Error("Client is not initialized.");
            }
            const binaryTx = buffer_1.Buffer.concat([
                crypto_1.Crypto.uInt8ToBinary(1),
                transactionId,
                contractHash,
                crypto_1.Crypto.uLongToBinary(validTill),
                crypto_1.Crypto.utf8ToBinary(JSON.stringify(payload))
            ]);
            const signature = privateKey.sign(buffer_1.Buffer.concat([this.signPrefix, binaryTx]));
            if (binaryTx.length + privateKey.publicKey.length + signature.length > 100000) {
                throw new Error("Transaction too large.");
            }
            const request = {
                base64tx: crypto_1.Crypto.binaryToBase64(buffer_1.Buffer.concat([
                    crypto_1.Crypto.uInt32ToBinary(binaryTx.length + privateKey.publicKey.length + signature.length),
                    binaryTx,
                    signature,
                    privateKey.publicKey
                ])),
                createTs: Date.now(),
                wait: true
            };
            return this.query("process", request, quickFail);
        });
    }
    getProcessedTx(transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const hexTransactionId = crypto_1.Crypto.binaryToHex(transactionId);
            const txPush = this.transactionPushMap.get(hexTransactionId);
            if (txPush !== undefined) {
                return txPush.promise;
            }
            const promise = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const data = yield this.query("transaction", { txId: hexTransactionId, push: true, wait: true }, false);
                    if (data !== undefined) {
                        resolve(data);
                    }
                    else {
                        this.transactionPushMap.set(hexTransactionId, { resolve, reject, promise, error: new Error() });
                    }
                }
                catch (error) {
                    reject(error);
                }
            }));
            return promise;
        });
    }
    query(type, data, quickFail = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = crypto_1.Crypto.binaryToHex(crypto_1.Crypto.id());
            const request = { type, id, data };
            if (this.webSocket === undefined || this.webSocket.readyState !== WebSocket.OPEN) {
                if (this.connected === Connected.NoNotSupported || this.connected === Connected.NoClosed) {
                    throw new Error("Connection permanently closed.");
                }
                else if (quickFail) {
                    throw new Error("[-4] No connection");
                }
                else {
                    return new Promise((resolve, reject) => this.requestResponseMap.set(id, { type, data, resolve, reject, error: new Error() }));
                }
            }
            const requestString = JSON.stringify(request);
            log_1.Log.debug(`Request: ${requestString}`);
            this.webSocket.send(requestString);
            return new Promise((resolve, reject) => this.requestResponseMap.set(id, { type, data, resolve, reject, error: new Error() }));
        });
    }
    createWebsocket() {
        if (this.connected === Connected.NoNotSupported || this.connected === Connected.NoClosed) {
            return;
        }
        this.webSocket = new WebSocket(this.serviceURL);
        this.webSocket.onopen = () => {
            log_1.Log.debug("Websocket connected.");
            this.connected = Connected.Yes;
            if (this.initResolve !== undefined) {
                this.initResolve();
                this.initResolve = undefined;
            }
            for (const key of Array.from(this.requestResponseMap.keys())) {
                const requestMap = this.requestResponseMap.get(key);
                this.query(requestMap.type, requestMap.data).then(requestMap.resolve).catch(requestMap.reject);
                this.requestResponseMap.delete(key);
            }
            this.emit("connection", Connected.Yes);
            this.timeout = this.reconnectTimeout * (0.5 + Math.random());
        };
        this.webSocket.onerror = () => {
        };
        this.webSocket.onmessage = (message) => {
            let response;
            try {
                response = JSON.parse(message.data);
            }
            catch (error) {
                log_1.Log.warn(`Message data: ${message.data}`);
                log_1.Log.error("Received message is not valid json.", error);
                return;
            }
            if (response.id !== undefined) {
                log_1.Log.debug(`Response: ${message.data}`);
                const responseMap = this.requestResponseMap.get(response.id);
                if (responseMap !== undefined) {
                    if (response.error !== undefined) {
                        let error = responseMap.error;
                        try {
                            error.message = `[${response.status}] ${response.error}`;
                        }
                        catch (e) {
                            error = new Error(`[${response.status}] ${response.error}`);
                        }
                        responseMap.reject(error);
                    }
                    else {
                        responseMap.resolve(response.data);
                    }
                    this.requestResponseMap.delete(response.id);
                }
                else {
                    log_1.Log.error(`Received response to unknown request: ${message.data}`);
                }
            }
            else {
                log_1.Log.debug(`Push: ${message.data}`);
                if (response.error === undefined && typeof response.pushType === "string") {
                    if (response.pushType === "transaction") {
                        const pushResponse = this.transactionPushMap.get(response.data.id);
                        if (pushResponse !== undefined) {
                            pushResponse.resolve(response.data);
                        }
                    }
                    this.emit(response.pushType, response.data);
                    this.emit("deprecatedMessage", { type: response.pushType, data: response.data, status: response.status });
                }
                else {
                    log_1.Log.error(`Received invalid push message: ${message.data}`);
                }
            }
        };
        this.webSocket.onclose = (ev) => {
            if (ev.code === 1000) {
                log_1.Log.info("User closed websocket connection, not reconnecting.");
                this.connected = Connected.NoClosed;
                for (const requestKey of this.requestResponseMap.keys()) {
                    this.requestResponseMap.get(requestKey).reject(new Error("[-1] Connection closed by user."));
                    this.requestResponseMap.delete(requestKey);
                }
                this.emit("connection", this.connected);
            }
            else if (ev.code === 1001) {
                log_1.Log.info("Server going offline, reconnecting in a moment...");
                this.connected = Connected.NoDisconnected;
                this.emit("connection", this.connected);
            }
            else if (ev.code === 4100) {
                this.connected = Connected.NoNotSupported;
                for (const requestKey of this.requestResponseMap.keys()) {
                    this.requestResponseMap.get(requestKey).reject(new Error("[-2] Version of api not supported."));
                    this.requestResponseMap.delete(requestKey);
                }
                this.emit("connection", this.connected);
            }
            else {
                if (this.connected === Connected.Yes) {
                    this.connected = Connected.NoCrashed;
                    for (const requestKey of this.requestResponseMap.keys()) {
                        const resp = this.requestResponseMap.get(requestKey);
                        log_1.Log.warn(`Outstanding requests: ${requestKey}: type: ${resp.type}`);
                        resp.reject(new Error("[-3] Connection to server lost."));
                        this.requestResponseMap.delete(requestKey);
                    }
                    log_1.Log.warn("Websocket connection lost, reconnecting in a moment...");
                    this.emit("connection", this.connected);
                }
                else if (this.connected === Connected.NoJustStarted) {
                    log_1.Log.info("Failed to connect, trying again in a moment...");
                }
                else {
                    log_1.Log.info("Failed to reconnect, trying again in a moment...");
                }
            }
            setTimeout(() => this.createWebsocket(), Math.min(this.timeout, this.maxReconnectTimeout));
            this.timeout *= 1.5;
        };
    }
    closeWebsocket() {
        if (this.webSocket === undefined) {
            this.connected = Connected.NoClosed;
            this.emit("connected", this.connected);
        }
        else {
            this.webSocket.close(1000, "User closed websocket.");
        }
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    addObserver(o) {
        if (!Client.deprecatedAddObserverWarning) {
            Client.deprecatedAddObserverWarning = true;
            log_1.Log.warn("addObserver() is now deprecated. Use on(event) instead. This function will be removed next version.", new Error("Deprecated"));
        }
        if (typeof o === "function") {
            this.on("connection", o);
            this.on("deprecatedMessage", o);
        }
        else if (this.listeners("deprecatedMessage").indexOf(o.update) === -1) {
            this.on("connection", (arg) => o.update(this, arg));
            this.on("deprecatedMessage", (arg) => o.update(this, arg));
        }
    }
    notifyObservers(arg) {
        if (!Client.deprecatedNotifyObserversWarning) {
            Client.deprecatedNotifyObserversWarning = true;
            log_1.Log.warn("notifyObservers() is now deprecated. Use emit(event) instead. This function will be removed next version.", new Error("Deprecated"));
        }
        this.emit("connection", arg);
        this.emit("deprecatedMessage", arg);
    }
    hasObserver(o) { return this.listeners("deprecatedMessage").indexOf(o.update) !== -1; }
    countObservers() { return this.listenerCount("deprecatedMessage"); }
    countCallbacks() { return this.listenerCount("deprecatedMessage"); }
    deleteObserver(o) { this.removeListener("connection", o.update); this.removeListener("deprecatedMessage", o.update); }
    hasChanged() { return false; }
}
exports.Client = Client;
Client.instance = undefined;
Client.deprecatedAddObserverWarning = false;
Client.deprecatedNotifyObserversWarning = false;
Client.depricatedInitWarning = false;
Client.depricatedSignWarning = false;
