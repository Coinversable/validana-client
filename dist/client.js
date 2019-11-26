"use strict";
/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var Buffer = require("buffer").Buffer;
var EventEmitter = require("events").EventEmitter;
var WebSocket = typeof window === "undefined" ? require("ws") : window.WebSocket;
var log_1 = require("./tools/log");
var crypto_1 = require("./tools/crypto");
var Connected;
(function (Connected) {
    Connected[Connected["Yes"] = 0] = "Yes";
    Connected[Connected["NoJustStarted"] = 1] = "NoJustStarted";
    Connected[Connected["NoDisconnected"] = 2] = "NoDisconnected";
    Connected[Connected["NoCrashed"] = 3] = "NoCrashed";
    Connected[Connected["NoNotSupported"] = 4] = "NoNotSupported";
    Connected[Connected["NoClosed"] = 5] = "NoClosed";
})(Connected = exports.Connected || (exports.Connected = {}));
var Client = (function (_super) {
    __extends(Client, _super);
    function Client() {
        var _this = _super.call(this) || this;
        _this.reconnectTimeout = 5000;
        _this.maxReconnectTimeout = 60000;
        _this.isInitialized = false;
        _this.connected = Connected.NoJustStarted;
        _this.timeout = 5000;
        _this.requestResponseMap = new Map();
        _this.transactionPushMap = new Map();
        _this.setMaxListeners(0);
        return _this;
    }
    Client.get = function (forceNew) {
        if (forceNew === void 0) { forceNew = false; }
        if (forceNew) {
            return new Client();
        }
        if (Client.instance === undefined) {
            Client.instance = new Client();
        }
        return Client.instance;
    };
    Client.prototype.init = function (signPrefix, serviceURL, reconnectTimeout, maxReconnectTimeout) {
        var _this = this;
        if (reconnectTimeout === void 0) { reconnectTimeout = 5000; }
        if (maxReconnectTimeout === void 0) { maxReconnectTimeout = 60000; }
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
            this.initPromise = new Promise(function (resolve) { return _this.initResolve = resolve; });
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
    };
    Client.prototype.isConnected = function () {
        return this.connected;
    };
    Client.prototype.sign = function (toSign, privateKey) {
        if (!Client.depricatedSignWarning) {
            Client.depricatedSignWarning = true;
            log_1.Log.warn("Client.sign() is now deprecated. Use PrivateKey.sign() instead. This function will be removed next version.", new Error("Deprecated"));
        }
        return privateKey.sign(toSign);
    };
    Client.prototype.processTx = function (privateKey, contractName, payload, validTill, quickFail) {
        if (validTill === void 0) { validTill = Date.now() + 900000; }
        if (quickFail === void 0) { quickFail = false; }
        return __awaiter(this, void 0, void 0, function () {
            var contracts, contract, _a, _b, key, _c, _d, key, id, error_1, error2_1;
            var e_1, _e, e_2, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4, this.query("contracts", contractName, quickFail)];
                    case 1:
                        contracts = _g.sent();
                        contract = contracts.filter(function (aContract) { return aContract.type === contractName; }).sort(function (a, b) {
                            var versionA = a.version.split(".").map(function (num) { return parseInt(num, 10); });
                            var versionB = b.version.split(".").map(function (num) { return parseInt(num, 10); });
                            for (var i = 0; i < versionA.length; i++) {
                                if (versionB.length <= i || versionA[i] > versionB[i]) {
                                    return -1;
                                }
                                else if (versionB[i] > versionA[i]) {
                                    return 1;
                                }
                            }
                            return 1;
                        })[0];
                        if (!(contract === undefined)) return [3, 2];
                        throw new Error("Contract does not exist (anymore).");
                    case 2:
                        try {
                            for (_a = __values(Object.keys(payload)), _b = _a.next(); !_b.done; _b = _a.next()) {
                                key = _b.value;
                                if (contract.template[key] === undefined) {
                                    throw new Error("Payload not valid for contract, extra key: " + key + ".");
                                }
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        try {
                            for (_c = __values(Object.keys(contract.template)), _d = _c.next(); !_d.done; _d = _c.next()) {
                                key = _d.value;
                                if (payload[key] === undefined && !contract.template[key].type.endsWith("?")) {
                                    throw new Error("Payload not valid for contract, missing key: " + key + ".");
                                }
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_d && !_d.done && (_f = _c.return)) _f.call(_c);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        id = crypto_1.Crypto.id();
                        _g.label = 3;
                    case 3:
                        _g.trys.push([3, 5, , 6]);
                        return [4, this.signAndSend(privateKey, id, crypto_1.Crypto.hexToBinary(contract.hash), payload, validTill, quickFail)];
                    case 4:
                        _g.sent();
                        return [3, 6];
                    case 5:
                        error_1 = _g.sent();
                        throw new Error("Failed to deliver transaction: " + error_1.message);
                    case 6:
                        _g.trys.push([6, 8, , 9]);
                        return [4, this.getProcessedTx(id)];
                    case 7: return [2, _g.sent()];
                    case 8:
                        error2_1 = _g.sent();
                        throw new Error("Transaction delivered, but unable to determine status: " + error2_1.message);
                    case 9: return [2];
                }
            });
        });
    };
    Client.prototype.signAndSend = function (privateKey, transactionId, contractHash, payload, validTill, quickFail) {
        if (validTill === void 0) { validTill = Date.now() + 900000; }
        if (quickFail === void 0) { quickFail = false; }
        return __awaiter(this, void 0, void 0, function () {
            var binaryTx, signature, request;
            return __generator(this, function (_a) {
                if (!this.isInitialized) {
                    throw new Error("Client is not initialized.");
                }
                binaryTx = Buffer.concat([
                    crypto_1.Crypto.uInt8ToBinary(1),
                    transactionId,
                    contractHash,
                    crypto_1.Crypto.uLongToBinary(validTill),
                    crypto_1.Crypto.utf8ToBinary(JSON.stringify(payload))
                ]);
                signature = privateKey.sign(Buffer.concat([this.signPrefix, binaryTx]));
                request = {
                    base64tx: crypto_1.Crypto.binaryToBase64(Buffer.concat([
                        crypto_1.Crypto.uInt32ToBinary(binaryTx.length + privateKey.publicKey.length + signature.length),
                        binaryTx,
                        signature,
                        privateKey.publicKey
                    ])),
                    createTs: Date.now()
                };
                return [2, this.query("process", request, quickFail)];
            });
        });
    };
    Client.prototype.getProcessedTx = function (transactionId) {
        return __awaiter(this, void 0, void 0, function () {
            var hexTransactionId, txPush, promise;
            var _this = this;
            return __generator(this, function (_a) {
                hexTransactionId = crypto_1.Crypto.binaryToHex(transactionId);
                txPush = this.transactionPushMap.get(hexTransactionId);
                if (txPush !== undefined) {
                    return [2, txPush.promise];
                }
                promise = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var data, error_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4, this.query("transaction", { txId: hexTransactionId, push: true, wait: true }, false)];
                            case 1:
                                data = _a.sent();
                                if (data !== undefined) {
                                    resolve(data);
                                }
                                else {
                                    this.transactionPushMap.set(hexTransactionId, { resolve: resolve, reject: reject, promise: promise, error: new Error() });
                                }
                                return [3, 3];
                            case 2:
                                error_2 = _a.sent();
                                reject(error_2);
                                return [3, 3];
                            case 3: return [2];
                        }
                    });
                }); });
                return [2, promise];
            });
        });
    };
    Client.prototype.query = function (type, data, quickFail) {
        if (quickFail === void 0) { quickFail = false; }
        return __awaiter(this, void 0, void 0, function () {
            var id, request, requestString;
            var _this = this;
            return __generator(this, function (_a) {
                id = crypto_1.Crypto.binaryToHex(crypto_1.Crypto.id());
                request = { type: type, id: id, data: data };
                if (this.webSocket === undefined || this.webSocket.readyState !== WebSocket.OPEN) {
                    if (this.connected === Connected.NoNotSupported || this.connected === Connected.NoClosed) {
                        throw new Error("Connection permanently closed.");
                    }
                    else if (quickFail) {
                        throw new Error("[-4] No connection");
                    }
                    else {
                        return [2, new Promise(function (resolve, reject) { return _this.requestResponseMap.set(id, { type: type, data: data, resolve: resolve, reject: reject, error: new Error() }); })];
                    }
                }
                requestString = JSON.stringify(request);
                log_1.Log.debug("Request: " + requestString);
                this.webSocket.send(requestString);
                return [2, new Promise(function (resolve, reject) { return _this.requestResponseMap.set(id, { type: type, data: data, resolve: resolve, reject: reject, error: new Error() }); })];
            });
        });
    };
    Client.prototype.createWebsocket = function () {
        var _this = this;
        if (this.connected === Connected.NoNotSupported || this.connected === Connected.NoClosed) {
            return;
        }
        this.webSocket = new WebSocket(this.serviceURL);
        this.webSocket.onopen = function () {
            var e_3, _a;
            log_1.Log.debug("Websocket connected.");
            _this.connected = Connected.Yes;
            if (_this.initResolve !== undefined) {
                _this.initResolve();
                _this.initResolve = undefined;
            }
            try {
                for (var _b = __values(Array.from(_this.requestResponseMap.keys())), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var key = _c.value;
                    var requestMap = _this.requestResponseMap.get(key);
                    _this.query(requestMap.type, requestMap.data).then(requestMap.resolve).catch(requestMap.reject);
                    _this.requestResponseMap.delete(key);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            _this.emit("connection", Connected.Yes);
            _this.timeout = _this.reconnectTimeout * (0.5 + Math.random());
        };
        this.webSocket.onerror = function () {
        };
        this.webSocket.onmessage = function (message) {
            var response;
            try {
                response = JSON.parse(message.data);
            }
            catch (error) {
                log_1.Log.warn("Message data: " + message.data);
                log_1.Log.error("Received message is not valid json.", error);
                return;
            }
            if (response.id !== undefined) {
                log_1.Log.debug("Response: " + message.data);
                var responseMap = _this.requestResponseMap.get(response.id);
                if (responseMap !== undefined) {
                    if (response.error !== undefined) {
                        var error = responseMap.error;
                        try {
                            error.message = "[" + response.status + "] " + response.error;
                        }
                        catch (e) {
                            error = new Error("[" + response.status + "] " + response.error);
                        }
                        responseMap.reject(error);
                    }
                    else {
                        responseMap.resolve(response.data);
                    }
                    _this.requestResponseMap.delete(response.id);
                }
                else {
                    log_1.Log.error("Received response to unknown request: " + message.data);
                }
            }
            else {
                log_1.Log.debug("Push: " + message.data);
                if (response.error === undefined && typeof response.pushType === "string") {
                    if (response.pushType === "transaction") {
                        var pushResponse = _this.transactionPushMap.get(response.data.id);
                        if (pushResponse !== undefined) {
                            pushResponse.resolve(response.data);
                        }
                    }
                    _this.emit(response.pushType, response.data);
                    _this.emit("deprecatedMessage", { type: response.pushType, data: response.data, status: response.status });
                }
                else {
                    log_1.Log.error("Received invalid push message: " + message.data);
                }
            }
        };
        this.webSocket.onclose = function (ev) {
            var e_4, _a, e_5, _b, e_6, _c;
            if (ev.code === 1000) {
                log_1.Log.info("User closed websocket connection, not reconnecting.");
                _this.connected = Connected.NoClosed;
                try {
                    for (var _d = __values(_this.requestResponseMap.keys()), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var requestKey = _e.value;
                        _this.requestResponseMap.get(requestKey).reject(new Error("[-1] Connection closed by user."));
                        _this.requestResponseMap.delete(requestKey);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                _this.emit("connection", _this.connected);
            }
            else if (ev.code === 1001) {
                log_1.Log.info("Server going offline, reconnecting in a moment...");
                _this.connected = Connected.NoDisconnected;
                _this.emit("connection", _this.connected);
            }
            else if (ev.code === 4100) {
                try {
                    for (var _f = __values(_this.requestResponseMap.keys()), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var requestKey = _g.value;
                        _this.requestResponseMap.get(requestKey).reject(new Error("[-2] Version of api not supported."));
                        _this.requestResponseMap.delete(requestKey);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                _this.connected = Connected.NoNotSupported;
                _this.emit("connection", _this.connected);
            }
            else {
                if (_this.connected === Connected.Yes) {
                    _this.connected = Connected.NoCrashed;
                    try {
                        for (var _h = __values(_this.requestResponseMap.keys()), _j = _h.next(); !_j.done; _j = _h.next()) {
                            var requestKey = _j.value;
                            var resp = _this.requestResponseMap.get(requestKey);
                            log_1.Log.warn("Outstanding requests: " + requestKey + ": type: " + resp.type);
                            resp.reject(new Error("[-3] Connection to server lost."));
                            _this.requestResponseMap.delete(requestKey);
                        }
                    }
                    catch (e_6_1) { e_6 = { error: e_6_1 }; }
                    finally {
                        try {
                            if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                        }
                        finally { if (e_6) throw e_6.error; }
                    }
                    log_1.Log.warn("Websocket connection lost, reconnecting in a moment...");
                    _this.emit("connection", _this.connected);
                }
                else if (_this.connected === Connected.NoJustStarted) {
                    log_1.Log.info("Failed to connect, trying again in a moment...");
                }
                else {
                    log_1.Log.info("Failed to reconnect, trying again in a moment...");
                }
            }
            setTimeout(function () { return _this.createWebsocket(); }, Math.min(_this.timeout, _this.maxReconnectTimeout));
            _this.timeout *= 1.5;
        };
    };
    Client.prototype.closeWebsocket = function () {
        if (this.webSocket === undefined) {
            this.connected = Connected.NoClosed;
            this.emit("connected", this.connected);
        }
        else {
            this.webSocket.close(1000, "User closed websocket.");
        }
    };
    Client.prototype.on = function (event, listener) {
        return _super.prototype.on.call(this, event, listener);
    };
    Client.prototype.addObserver = function (o) {
        var _this = this;
        if (!Client.deprecatedAddObserverWarning) {
            Client.deprecatedAddObserverWarning = true;
            log_1.Log.warn("addObserver() is now deprecated. Use on(event) instead. This function will be removed next version.", new Error("Deprecated"));
        }
        if (typeof o === "function") {
            this.on("connection", o);
            this.on("deprecatedMessage", o);
        }
        else if (this.listeners("deprecatedMessage").indexOf(o.update) === -1) {
            this.on("connection", function (arg) { return o.update(_this, arg); });
            this.on("deprecatedMessage", function (arg) { return o.update(_this, arg); });
        }
    };
    Client.prototype.notifyObservers = function (arg) {
        if (!Client.deprecatedNotifyObserversWarning) {
            Client.deprecatedNotifyObserversWarning = true;
            log_1.Log.warn("notifyObservers() is now deprecated. Use emit(event) instead. This function will be removed next version.", new Error("Deprecated"));
        }
        this.emit("connection", arg);
        this.emit("deprecatedMessage", arg);
    };
    Client.prototype.hasObserver = function (o) { return this.listeners("deprecatedMessage").indexOf(o.update) !== -1; };
    Client.prototype.countObservers = function () { return this.listenerCount("deprecatedMessage"); };
    Client.prototype.countCallbacks = function () { return this.listenerCount("deprecatedMessage"); };
    Client.prototype.deleteObserver = function (o) { this.removeListener("connection", o.update); this.removeListener("deprecatedMessage", o.update); };
    Client.prototype.hasChanged = function () { return false; };
    Client.instance = undefined;
    Client.deprecatedAddObserverWarning = false;
    Client.deprecatedNotifyObserversWarning = false;
    Client.depricatedInitWarning = false;
    Client.depricatedSignWarning = false;
    return Client;
}(EventEmitter));
exports.Client = Client;
