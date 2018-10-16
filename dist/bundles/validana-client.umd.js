(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('raven-js'), require('bitcoinjs-lib')) :
	typeof define === 'function' && define.amd ? define('validana-client', ['exports', 'raven-js', 'bitcoinjs-lib'], factory) :
	(factory((global['validana-client'] = {}),global.ravenJs,global.bitcoinjsLib));
}(this, (function (exports,ravenJs,bitcoinjsLib) { 'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0
THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.
See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */
var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}





function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}
function __generator(thisArg, body) {
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
}

function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
}

/**
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
var Log = /** @class */ (function () {
    function Log() {
    }
    Log.setReportErrors = function (dns, ignoreLocalhost) {
        Log.reportErrors = true;
        ravenJs.config(dns, { autoBreadcrumbs: false, ignoreUrls: ignoreLocalhost ? [/localhost/] : [] }).install();
    };
    Log.isReportingErrors = function () {
        return Log.reportErrors;
    };
    Log.setUser = function (addr) {
        ravenJs.setUserContext({ id: addr });
    };
    Log.setRelease = function (version) {
        ravenJs.setRelease(version);
    };
    Log.debug = function (msg, error) {
        if (Log.Level <= Log.Debug) {
            if (console.debug !== undefined) {
                console.debug(msg + (error !== undefined ? ": " + error.stack : ""));
            }
            else {
                console.info(msg + (error !== undefined ? ": " + error.stack : ""));
            }
        }
    };
    Log.info = function (msg, error) {
        if (Log.Level <= Log.Info) {
            console.info(msg + (error !== undefined ? ": " + error.stack : ""));
            if (Log.reportErrors) {
                if (error !== undefined) {
                    ravenJs.captureBreadcrumb({ level: "info", message: msg, data: { stack: error.stack } });
                }
                else {
                    ravenJs.captureBreadcrumb({ level: "info", message: msg });
                }
            }
        }
    };
    Log.warn = function (msg, error) {
        if (Log.Level <= Log.Warning) {
            console.warn(msg + (error !== undefined ? ": " + error.stack : ""));
            if (Log.reportErrors) {
                if (error !== undefined) {
                    ravenJs.captureBreadcrumb({ level: "warning", message: msg, data: { stack: error.stack } });
                }
                else {
                    ravenJs.captureBreadcrumb({ level: "warning", message: msg });
                }
            }
        }
    };
    Log.error = function (msg, error) {
        if (Log.Level <= Log.Error) {
            console.error(msg + (error !== undefined ? ": " + error.stack : ""));
            if (Log.reportErrors) {
                if (error !== undefined) {
                    ravenJs.captureException(error, { level: "error", extra: { message: msg } });
                }
                else {
                    ravenJs.captureMessage(msg, { level: "error" });
                }
            }
        }
    };
    Log.fatal = function (msg, error) {
        if (Log.Level <= Log.Fatal) {
            console.error(msg + (error !== undefined ? ": " + error.stack : ""));
            if (Log.reportErrors) {
                if (error !== undefined) {
                    ravenJs.captureException(error, { level: ("fatal"), extra: { message: msg } });
                }
                else {
                    ravenJs.captureMessage(msg, { level: ("fatal") });
                }
            }
        }
    };
    return Log;
}());
Log.reportErrors = false;
Log.Debug = 0;
Log.Info = 1;
Log.Warning = 2;
Log.Error = 3;
Log.Fatal = 4;
Log.None = 5;
Log.Level = Log.Error;
Log.options = { tags: { clientVersion: "1.0.0" }, extra: {} };
/**
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
var md5Func = require("md5");
var randomBytes = require("randombytes");
var Buffer = require("buffer").Buffer;
var Crypto = /** @class */ (function () {
    function Crypto() {
    }
    Crypto.hash160 = function (buffer) {
        return bitcoinjsLib.crypto.hash160(buffer);
    };
    Crypto.hash256 = function (buffer) {
        return bitcoinjsLib.crypto.hash256(buffer);
    };
    Crypto.ripemd160 = function (buffer) {
        return bitcoinjsLib.crypto.ripemd160(buffer);
    };
    Crypto.sha1 = function (buffer) {
        return bitcoinjsLib.crypto.sha1(buffer);
    };
    Crypto.sha256 = function (buffer) {
        return bitcoinjsLib.crypto.sha256(buffer);
    };
    Crypto.md5 = function (buffer) {
        return Buffer.from(md5Func(buffer), "hex");
    };
    Crypto.isHex = function (text) {
        return text.search(/^[0-9A-Fa-f]*$/) === 0 && (text.length & 0x1) === 0;
    };
    Crypto.hexToBinary = function (hex) {
        return Buffer.from(hex, "hex");
    };
    Crypto.binaryToHex = function (binary) {
        return binary.toString("hex");
    };
    Crypto.isBase58 = function (text) {
        return text.search(/^[1-9A-HJ-NP-Za-km-z]*$/) === 0;
    };
    Crypto.base58ToBinary = function (base58) {
        var e_1, _b;
        if (base58.length === 0) {
            return Buffer.alloc(0);
        }
        var bytes = [0];
        try {
            for (var base58_1 = __values(base58), base58_1_1 = base58_1.next(); !base58_1_1.done; base58_1_1 = base58_1.next()) {
                var char = base58_1_1.value;
                var value = Crypto.base58map[char];
                if (value === undefined) {
                    throw new Error("Invalid character.");
                }
                for (var j = 0; j < bytes.length; j++) {
                    value += bytes[j] * 58;
                    bytes[j] = value & 0xff;
                    value >>= 8;
                }
                while (value > 0) {
                    bytes.push(value & 0xff);
                    value >>= 8;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (base58_1_1 && !base58_1_1.done && (_b = base58_1.return)) _b.call(base58_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        for (var k = 0; base58[k] === Crypto.base58chars[0] && k < base58.length - 1; k++) {
            bytes.push(0);
        }
        return Buffer.from(bytes.reverse());
    };
    Crypto.binaryToBase58 = function (binary) {
        if (binary.length === 0) {
            return "";
        }
        var result = "";
        var digits = [0];
        for (var j = 0; j < binary.length; j++) {
            var byte = binary[j];
            for (var i = 0; i < digits.length; i++) {
                byte += digits[i] << 8;
                digits[i] = byte % 58;
                byte = (byte / 58) | 0;
            }
            while (byte > 0) {
                digits.push(byte % 58);
                byte = (byte / 58) | 0;
            }
        }
        for (var i = 0; binary[i] === 0 && i < binary.length - 1; i++) {
            result += Crypto.base58chars[0];
        }
        for (var i = digits.length - 1; i >= 0; i--) {
            result += Crypto.base58chars[digits[i]];
        }
        return result;
    };
    Crypto.isBase64 = function (text) {
        return text.search(/^[\+\/-9A-Za-z]*={0,2}$/) === 0 && (text.length & 0x3) === 0;
    };
    Crypto.base64ToBinary = function (base64) {
        return Buffer.from(base64, "base64");
    };
    Crypto.binaryToBase64 = function (binary) {
        return binary.toString("base64");
    };
    Crypto.isUtf8Postgres = function (text) {
        return text.indexOf("\0") === -1;
    };
    Crypto.makeUtf8Postgres = function (text) {
        return text.replace("\0", "");
    };
    Crypto.utf8ToBinary = function (text) {
        return Buffer.from(text, "utf8");
    };
    Crypto.binaryToUtf8 = function (binary) {
        return binary.toString("utf8");
    };
    Crypto.uInt8ToBinary = function (unsignedInt) {
        var buffer = Buffer.alloc(1);
        buffer.writeUInt8(unsignedInt, 0);
        return buffer;
    };
    Crypto.binaryToUInt8 = function (buffer) {
        return buffer.readUInt8(0);
    };
    Crypto.uInt16ToBinary = function (unsignedInt) {
        var buffer = Buffer.alloc(2);
        buffer.writeUInt16LE(unsignedInt, 0);
        return buffer;
    };
    Crypto.binaryToUInt16 = function (buffer) {
        return buffer.readUInt16LE(0);
    };
    Crypto.uInt32ToBinary = function (unsignedInt) {
        var buffer = Buffer.alloc(4);
        buffer.writeUInt32LE(unsignedInt, 0);
        return buffer;
    };
    Crypto.binaryToUInt32 = function (buffer) {
        return buffer.readUInt32LE(0);
    };
    Crypto.uLongToBinary = function (ulong) {
        if (!Number.isSafeInteger(ulong) || ulong < 0) {
            throw new Error("Invalid number.");
        }
        var buffer = Buffer.allocUnsafe(8);
        buffer.writeUInt32LE(ulong % 4294967296, 0);
        buffer.writeUInt32LE(ulong / 4294967296, 4);
        return buffer;
    };
    Crypto.binaryToULong = function (binary) {
        var result = binary.readUInt32LE(0) + binary.readUInt32LE(4) * 4294967296;
        if (!Number.isSafeInteger(result)) {
            throw new Error("Invalid binary data.");
        }
        return result;
    };
    Crypto.id = function () {
        try {
            return randomBytes(16);
        }
        catch (_a) {
            var result = "";
            for (var i = 0; i < 4; i++) {
                result += (Math.random() * 16).toString(16).slice(2, 10);
            }
            return Crypto.hexToBinary(result);
        }
    };
    return Crypto;
}());
Crypto.base58chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
Crypto.base58map = Object.keys(Crypto.base58chars).reduce(function (obj, key) { return (obj[Crypto.base58chars[parseInt(key, 10)]] = parseInt(key, 10), obj); }, {});
var StringMap = /** @class */ (function () {
    function StringMap() {
        this.map = {};
    }
    StringMap.prototype.setFromObject = function (object, overwrite) {
        if (overwrite === void 0) { overwrite = true; }
        var e_2, _b;
        try {
            for (var _c = __values(Object.keys(object)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var key = _d.value;
                if (overwrite || !this.has(key)) {
                    this.map[key] = object[key];
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return this;
    };
    StringMap.prototype.setFromMap = function (map, overwrite) {
        if (overwrite === void 0) { overwrite = true; }
        var e_3, _b;
        try {
            for (var _c = __values(map.keys()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var key = _d.value;
                if (overwrite || !this.has(key)) {
                    this.map[key] = map.get(key);
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return this;
    };
    StringMap.prototype.get = function (key) {
        return this.map[key];
    };
    StringMap.prototype.set = function (key, value) {
        this.map[key] = value;
        return this;
    };
    StringMap.prototype.has = function (key) {
        return this.map.hasOwnProperty(key);
    };
    StringMap.prototype.delete = function (key) {
        delete this.map[key];
        return this;
    };
    StringMap.prototype.keys = function () {
        return Object.keys(this.map);
    };
    StringMap.prototype.values = function () {
        var e_4, _b;
        var result = [];
        try {
            for (var _c = __values(Object.keys(this.map)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var key = _d.value;
                result.push(this.map[key]);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return result;
    };
    StringMap.prototype.size = function () {
        return Object.keys(this.map).length;
    };
    StringMap.prototype.clear = function () {
        var e_5, _b;
        try {
            for (var _c = __values(Object.keys(this.map)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var key = _d.value;
                delete this.map[key];
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return this;
    };
    StringMap.prototype.entries = function () {
        return Object.assign({}, this.map);
    };
    return StringMap;
}());
/**
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
var VObservable = /** @class */ (function () {
    function VObservable() {
        this.observers = new Array();
        this.changed = false;
    }
    VObservable.prototype.addObserver = function (o) {
        if (this.observers.indexOf(o) === -1) {
            this.observers.push(o);
        }
    };
    VObservable.prototype.hasObserver = function (o) {
        return this.observers.indexOf(o) !== -1;
    };
    VObservable.prototype.clearChanged = function () {
        this.changed = false;
    };
    VObservable.prototype.countObservers = function () {
        return this.observers.length;
    };
    VObservable.prototype.deleteObserver = function (o) {
        var index = this.observers.indexOf(o);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    };
    VObservable.prototype.hasChanged = function () {
        return this.changed;
    };
    VObservable.prototype.notifyObservers = function (arg) {
        var e_6, _b;
        if (this.hasChanged()) {
            try {
                for (var _c = __values(this.observers), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var observer = _d.value;
                    observer.update(this, arg);
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                }
                finally { if (e_6) throw e_6.error; }
            }
            this.clearChanged();
        }
    };
    VObservable.prototype.setChanged = function () {
        this.changed = true;
    };
    return VObservable;
}());
/**
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
var Buffer$1 = require("buffer").Buffer;
var Connected = { Yes: 0, NoJustStarted: 1, NoDisconnected: 2, NoCrashed: 3, NoNotSupported: 4, };
Connected[Connected.Yes] = "Yes";
Connected[Connected.NoJustStarted] = "NoJustStarted";
Connected[Connected.NoDisconnected] = "NoDisconnected";
Connected[Connected.NoCrashed] = "NoCrashed";
Connected[Connected.NoNotSupported] = "NoNotSupported";
var Client = /** @class */ (function (_super) {
    __extends(Client, _super);
    function Client() {
        var _this = _super.call(this) || this;
        _this.signMethod = "hash256-ecdsa-compact";
        _this.reconnectTimeout = 5000;
        _this.maxReconnectTimeout = 60000;
        _this.isInitialized = false;
        _this.connected = Connected.NoJustStarted;
        _this.timeout = 5000;
        _this.requestResponseMap = new StringMap();
        return _this;
    }
    Client.get = function () {
        if (this.instance === undefined) {
            this.instance = new Client();
        }
        return this.instance;
    };
    Client.prototype.init = function (signPrefix, serviceURL, processURL, signMethod, reconnectTimeout, maxReconnectTimeout) {
        if (processURL === void 0) { processURL = serviceURL; }
        if (signMethod === void 0) { signMethod = "hash256-ecdsa-compact"; }
        if (reconnectTimeout === void 0) { reconnectTimeout = 5000; }
        if (maxReconnectTimeout === void 0) { maxReconnectTimeout = 60000; }
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
            if (this.processURL !== this.serviceURL && ((this.processURL)).slice(0, 4) !== "http") {
                throw new Error("processURL should be the same as serviceURL or a http(s) url");
            }
            this.signPrefix = Crypto.utf8ToBinary(signPrefix);
            this.signMethod = signMethod;
            this.reconnectTimeout = reconnectTimeout;
            this.maxReconnectTimeout = maxReconnectTimeout;
            this.createWebsocket();
        }
    };
    Client.prototype.isConnected = function () {
        return this.connected;
    };
    Client.prototype.sign = function (toSign, privateKey, method) {
        var result;
        switch (method) {
            case "hash256-ecdsa-compact":
            default:
                result = privateKey.sign(toSign);
        }
        return result;
    };
    Client.prototype.processTx = function (privateKey, contractName, payload, validTill) {
        if (validTill === void 0) { validTill = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var e_7, _b, e_8, _c, contracts, contracts_1, contracts_1_1, contract, _d, _e, key, id, error2_1, error_1, e_7_1;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, this.query("contracts", undefined, true)];
                    case 1:
                        contracts = _f.sent();
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, 13, 14, 15]);
                        contracts_1 = __values(contracts), contracts_1_1 = contracts_1.next();
                        _f.label = 3;
                    case 3:
                        if (!!contracts_1_1.done) return [3 /*break*/, 12];
                        contract = contracts_1_1.value;
                        if (!(contract.type === contractName)) return [3 /*break*/, 11];
                        if (Object.keys(contract.template).length !== Object.keys(payload).length) {
                            throw new Error("Payload not valid for contract.");
                        }
                        try {
                            for (_d = __values(Object.keys(contract.template)), _e = _d.next(); !_e.done; _e = _d.next()) {
                                key = _e.value;
                                if (((payload))[key] === undefined) {
                                    throw new Error("Payload not valid for contract.");
                                }
                            }
                        }
                        catch (e_8_1) { e_8 = { error: e_8_1 }; }
                        finally {
                            try {
                                if (_e && !_e.done && (_c = _d.return)) _c.call(_d);
                            }
                            finally { if (e_8) throw e_8.error; }
                        }
                        id = Crypto.id();
                        _f.label = 4;
                    case 4:
                        _f.trys.push([4, 10, , 11]);
                        return [4 /*yield*/, this.signAndSend(privateKey, id, Crypto.hexToBinary(contract.hash), payload, validTill)];
                    case 5:
                        _f.sent();
                        _f.label = 6;
                    case 6:
                        _f.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.getProcessedTx(id)];
                    case 7: return [2 /*return*/, _f.sent()];
                    case 8:
                        error2_1 = _f.sent();
                        throw new Error("Transaction delivered, but unable to determine status: " + error2_1.message);
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        error_1 = _f.sent();
                        throw new Error("Failed to deliver transaction: " + error_1.message);
                    case 11:
                        contracts_1_1 = contracts_1.next();
                        return [3 /*break*/, 3];
                    case 12: return [3 /*break*/, 15];
                    case 13:
                        e_7_1 = _f.sent();
                        e_7 = { error: e_7_1 };
                        return [3 /*break*/, 15];
                    case 14:
                        try {
                            if (contracts_1_1 && !contracts_1_1.done && (_b = contracts_1.return)) _b.call(contracts_1);
                        }
                        finally { if (e_7) throw e_7.error; }
                        return [7 /*endfinally*/];
                    case 15: throw new Error("Contract does not exist (anymore).");
                }
            });
        });
    };
    Client.prototype.signAndSend = function (privateKey, transactionId, contractHash, payload, validTill) {
        if (validTill === void 0) { validTill = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var binaryTx, publicKey, signature, request;
            return __generator(this, function (_b) {
                if (!this.isInitialized) {
                    throw new Error("Coinversable is not initialized.");
                }
                binaryTx = Buffer$1.concat([
                    Crypto.uInt8ToBinary(1),
                    transactionId,
                    contractHash,
                    Crypto.uLongToBinary(validTill),
                    Crypto.utf8ToBinary(JSON.stringify(payload))
                ]);
                publicKey = privateKey.getPublicKey();
                signature = this.sign(Buffer$1.concat([((this.signPrefix)), binaryTx]), privateKey, this.signMethod);
                request = {
                    base64tx: Crypto.binaryToBase64(Buffer$1.concat([
                        Crypto.uInt32ToBinary(binaryTx.length + publicKey.length + signature.length),
                        binaryTx,
                        signature,
                        publicKey
                    ])),
                    createTs: Date.now()
                };
                return [2 /*return*/, this.query("process", request, true)];
            });
        });
    };
    Client.prototype.getProcessedTx = function (transactionId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return new Helper(transactionId, resolve, reject); })];
            });
        });
    };
    Client.prototype.query = function (type, data, quickFail) {
        if (quickFail === void 0) { quickFail = false; }
        return __awaiter(this, void 0, void 0, function () {
            var id, request, requestString;
            var _this = this;
            return __generator(this, function (_b) {
                if (type === "process" && (this.processURL !== this.serviceURL || !this.isInitialized)) {
                    if (!this.isInitialized) {
                        throw new Error("Coinversable not initialized");
                    }
                    else {
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var restRequest = new XMLHttpRequest();
                                restRequest.onreadystatechange = function () {
                                    if (restRequest.readyState === 4) {
                                        if (restRequest.status === 200) {
                                            resolve(restRequest.responseText);
                                        }
                                        else {
                                            reject(restRequest.responseText !== "" ? restRequest.responseText : "Failed to connect.");
                                        }
                                    }
                                };
                                restRequest.open("POST", ((_this.processURL)) + "process", true);
                                restRequest.send(JSON.stringify(data));
                            })];
                    }
                }
                id = Crypto.binaryToHex(Crypto.id());
                request = {
                    type: type,
                    id: id
                };
                if (data !== undefined) {
                    request.data = data;
                }
                if (this.webSocket === undefined || this.webSocket.readyState !== WebSocket.OPEN) {
                    if (this.connected !== Connected.NoCrashed && this.connected !== Connected.NoNotSupported) {
                        if (quickFail) {
                            throw new Error("No connection");
                        }
                        else {
                            return [2 /*return*/, new Promise(function (resolve, reject) { return _this.requestResponseMap.set(id, { type: type, data: data, resolve: resolve, reject: reject }); })];
                        }
                    }
                    else {
                        throw new Error("Connection to backend crashed.");
                    }
                }
                requestString = JSON.stringify(request);
                Log.debug("Request: " + requestString);
                this.webSocket.send(requestString);
                return [2 /*return*/, new Promise(function (resolve, reject) { return _this.requestResponseMap.set(id, { type: type, data: data, resolve: resolve, reject: reject }); })];
            });
        });
    };
    Client.prototype.createWebsocket = function () {
        var _this = this;
        this.webSocket = new WebSocket(((this.serviceURL)));
        this.webSocket.onopen = function () {
            var e_9, _b;
            _this.connected = Connected.Yes;
            try {
                for (var _c = __values(_this.requestResponseMap.keys()), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var key = _d.value;
                    var requestMap = _this.requestResponseMap.get(key);
                    _this.query(requestMap.type, requestMap.data).then(requestMap.resolve).catch(requestMap.reject);
                    _this.requestResponseMap.delete(key);
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                }
                finally { if (e_9) throw e_9.error; }
            }
            _this.setChanged();
            _this.notifyObservers(Connected.Yes);
            _this.timeout = _this.reconnectTimeout * (0.5 + Math.random());
        };
        this.webSocket.onmessage = function (message) {
            var response;
            try {
                response = JSON.parse(message.data);
            }
            catch (error) {
                Log.warn("Message data: " + message.data);
                Log.error("Received message is not valid json.", error);
                return;
            }
            if (response.id !== undefined) {
                Log.debug("Response: " + message.data);
                var responseMap = _this.requestResponseMap.get(response.id);
                if (responseMap !== undefined) {
                    if (response.error !== undefined) {
                        responseMap.reject(new Error(response.error));
                    }
                    else {
                        responseMap.resolve(response.data);
                    }
                    _this.requestResponseMap.delete(response.id);
                }
                else {
                    Log.warn("Received response to unknown request: " + message.data);
                }
            }
            else {
                Log.debug("Push: " + message.data);
                if (response.error === undefined && typeof response.pushType === "string") {
                    _this.setChanged();
                    _this.notifyObservers({
                        type: response.pushType,
                        data: response.data
                    });
                }
                else {
                    Log.warn("Received invalid push message: " + message.data);
                }
            }
        };
        this.webSocket.onclose = function (ev) {
            var e_10, _b, e_11, _c;
            if (ev.code === 1001) {
                Log.info("Server going offline, reconnecting in a moment...");
                _this.connected = Connected.NoDisconnected;
                _this.setChanged();
            }
            else if (ev.code === 4100) {
                try {
                    for (var _d = __values(_this.requestResponseMap.keys()), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var requestKey = _e.value;
                        _this.requestResponseMap.get(requestKey).reject(new Error("Version of api not supported."));
                        _this.requestResponseMap.delete(requestKey);
                    }
                }
                catch (e_10_1) { e_10 = { error: e_10_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                    }
                    finally { if (e_10) throw e_10.error; }
                }
                _this.connected = Connected.NoNotSupported;
                _this.setChanged();
            }
            else {
                if (_this.connected === Connected.Yes) {
                    try {
                        for (var _f = __values(_this.requestResponseMap.keys()), _g = _f.next(); !_g.done; _g = _f.next()) {
                            var requestKey = _g.value;
                            var data = _this.requestResponseMap.get(requestKey).data;
                            Log.warn("Outstanding requests: " + requestKey + ": type: " + _this.requestResponseMap.get(requestKey).type + " " +
                                ("data: " + (data !== undefined ? JSON.stringify(data) : undefined)));
                            _this.requestResponseMap.get(requestKey).reject(new Error("Connection to backend crashed."));
                            _this.requestResponseMap.delete(requestKey);
                        }
                    }
                    catch (e_11_1) { e_11 = { error: e_11_1 }; }
                    finally {
                        try {
                            if (_g && !_g.done && (_c = _f.return)) _c.call(_f);
                        }
                        finally { if (e_11) throw e_11.error; }
                    }
                    Log.error("Error in websocket connection, reconnecting in a moment...");
                    _this.connected = Connected.NoCrashed;
                    _this.setChanged();
                }
                else if (_this.connected === Connected.NoJustStarted) {
                    Log.info("Failed to connect, trying again in a moment...");
                }
                else {
                    Log.info("Failed to reconnect, trying again in a moment...");
                }
            }
            _this.notifyObservers(_this.connected);
            if (_this.connected !== Connected.NoNotSupported) {
                setTimeout(function () { return _this.createWebsocket(); }, Math.min(_this.timeout, _this.maxReconnectTimeout));
                _this.timeout *= 1.5;
            }
        };
    };
    return Client;
}(VObservable));
Client.instance = undefined;
var Helper = /** @class */ (function () {
    function Helper(id, resolve, reject) {
        var _this = this;
        this.id = Crypto.binaryToHex(id);
        this.resolve = resolve;
        this.reject = reject;
        Client.get().addObserver(this);
        Client.get().query("transaction", { txId: this.id, push: true }, true).then(function (data) {
            if (data !== undefined) {
                Client.get().deleteObserver(_this);
                _this.resolve(data);
            }
        }).catch(function (error) {
            _this.reject(error);
        });
    }
    Helper.prototype.update = function (_, arg) {
        var _this = this;
        if (typeof arg === "object" && arg.type === "transaction" && ((arg.data)).id === this.id) {
            Client.get().deleteObserver(this);
            this.resolve((arg.data));
        }
        else if (arg === Connected.Yes) {
            Client.get().query("transaction", { txId: this.id, push: true }, true).then(function (data) {
                if (data !== undefined) {
                    Client.get().deleteObserver(_this);
                    _this.resolve(data);
                }
            }).catch(function (error) {
                _this.reject(error);
            });
        }
    };
    return Helper;
}());
/**
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
var Buffer$2 = require("buffer").Buffer;
var PublicKey = /** @class */ (function () {
    function PublicKey(publicKey) {
        if (publicKey instanceof Buffer$2) {
            this.key = bitcoinjsLib.ECPair.fromPublicKeyBuffer(publicKey, bitcoinjsLib.networks.bitcoin);
        }
        else if (publicKey instanceof bitcoinjsLib.ECPair) {
            this.key = publicKey;
        }
        else {
            throw new Error("Invalid type for public key");
        }
        if (!this.key.compressed) {
            throw new Error("Only compressed keys are supported.");
        }
    }
    PublicKey.prototype.getPublicKey = function () {
        return this.key.getPublicKeyBuffer();
    };
    PublicKey.isValidPublic = function (publicKey) {
        try {
            return bitcoinjsLib.ECPair.fromPublicKeyBuffer(publicKey, bitcoinjsLib.networks.bitcoin).compressed;
        }
        catch (_a) {
            return false;
        }
    };
    PublicKey.isValidAddress = function (address) {
        if (typeof address !== "string") {
            return false;
        }
        try {
            var decodedAddress = Crypto.base58ToBinary(address);
            var checksum = decodedAddress.slice(-4);
            return decodedAddress[0] === 0x00 && Crypto.hash256(decodedAddress.slice(0, -4)).slice(0, 4).equals(checksum);
        }
        catch (_a) {
            return false;
        }
    };
    PublicKey.prototype.getAddress = function () {
        if (this.address === undefined) {
            this.address = this.key.getAddress();
        }
        return this.address;
    };
    PublicKey.verify = function (publicKey, hash, signature) {
        return bitcoinjsLib.ECPair.fromPublicKeyBuffer(publicKey, bitcoinjsLib.networks.bitcoin).verify(hash, bitcoinjsLib.ECSignature.parseCompact(Buffer$2.concat([Crypto.uInt8ToBinary(27), signature])).signature);
    };
    return PublicKey;
}());
var PrivateKey = /** @class */ (function (_super) {
    __extends(PrivateKey, _super);
    function PrivateKey(privateKey) {
        return _super.call(this, privateKey) || this;
    }
    PrivateKey.generate = function () {
        return new PrivateKey(bitcoinjsLib.ECPair.makeRandom({ compressed: true, network: bitcoinjsLib.networks.bitcoin }));
    };
    PrivateKey.isValidWIF = function (wif) {
        try {
            return bitcoinjsLib.ECPair.fromWIF(wif, bitcoinjsLib.networks.bitcoin).compressed;
        }
        catch (error) {
            return false;
        }
    };
    PrivateKey.prototype.toWIF = function () {
        return this.key.toWIF();
    };
    PrivateKey.fromWIF = function (wif) {
        var privateKey = bitcoinjsLib.ECPair.fromWIF(wif, bitcoinjsLib.networks.bitcoin);
        if (!privateKey.compressed) {
            throw new Error("Only compressed keys are supported.");
        }
        return new PrivateKey(privateKey);
    };
    PrivateKey.prototype.sign = function (data) {
        return this.key.sign(Crypto.hash256(data)).toCompact(0, false).slice(1);
    };
    return PrivateKey;
}(PublicKey));

exports.Client = Client;
exports.Connected = Connected;
exports.PrivateKey = PrivateKey;
exports.PublicKey = PublicKey;
exports.Crypto = Crypto;
exports.StringMap = StringMap;
exports.Log = Log;
exports.VObservable = VObservable;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=validana-client.umd.js.map
