import { config, setUserContext, setRelease, captureBreadcrumb, captureException, captureMessage } from 'raven-js';
import { crypto, ECPair, networks, ECSignature } from 'bitcoinjs-lib';
import { __awaiter } from 'tslib';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
class Log {
    /**
     * Set this logger to report errors. Will throw an error if there are problems with the url.
     * @param {?} dns
     * @param {?} ignoreLocalhost
     * @return {?}
     */
    static setReportErrors(dns, ignoreLocalhost) {
        Log.reportErrors = true;
        config(dns, { autoBreadcrumbs: false, ignoreUrls: ignoreLocalhost ? [/localhost/] : [] }).install();
    }
    /**
     * Is this logger registerd to report errors.
     * @return {?}
     */
    static isReportingErrors() {
        return Log.reportErrors;
    }
    /**
     * Set the user that is logged in.
     * @param {?} addr the address of the user
     * @return {?}
     */
    static setUser(addr) {
        setUserContext({ id: addr });
    }
    /**
     * Set the release version of the dashboard.
     * @param {?} version the version
     * @return {?}
     */
    static setRelease(version) {
        setRelease(version);
    }
    /**
     * Detailed information about the program flow that is used for debugging problems.
     * Will never be logged in a live environment.
     * @param {?} msg Description of the issue
     * @param {?=} error An optional error that may have arisen
     * @return {?}
     */
    static debug(msg, error) {
        if (Log.Level <= Log.Debug) {
            //Old version of nodejs don't have the console.debug function
            if (console.debug !== undefined) {
                console.debug(msg + (error !== undefined ? `: ${error.stack}` : ""));
            }
            else {
                console.info(msg + (error !== undefined ? `: ${error.stack}` : ""));
            }
        }
    }
    /**
     * Significant things that occur in normal circumstances.
     * @param {?} msg Description of the issue
     * @param {?=} error An optional error that may have arisen
     * @return {?}
     */
    static info(msg, error) {
        if (Log.Level <= Log.Info) {
            console.info(msg + (error !== undefined ? `: ${error.stack}` : ""));
            if (Log.reportErrors) {
                if (error !== undefined) {
                    captureBreadcrumb({ level: "info", message: msg, data: { stack: error.stack } });
                }
                else {
                    captureBreadcrumb({ level: "info", message: msg });
                }
            }
        }
    }
    /**
     * Problems which may occur in abnormal circumstances (loss of connection, etc), but are dealt with by the program.
     * @param {?} msg Description of the issue
     * @param {?=} error An optional error that may have arisen
     * @return {?}
     */
    static warn(msg, error) {
        if (Log.Level <= Log.Warning) {
            console.warn(msg + (error !== undefined ? `: ${error.stack}` : ""));
            if (Log.reportErrors) {
                if (error !== undefined) {
                    captureBreadcrumb({ level: "warning", message: msg, data: { stack: error.stack } });
                }
                else {
                    captureBreadcrumb({ level: "warning", message: msg });
                }
            }
        }
    }
    /**
     * Errors which require you to modify the program code, because they should never happen.
     * You will always be notified if this occurs.
     * @param {?} msg Description of the issue
     * @param {?=} error An optional error that may have arisen
     * @return {?}
     */
    static error(msg, error) {
        if (Log.Level <= Log.Error) {
            console.error(msg + (error !== undefined ? `: ${error.stack}` : ""));
            if (Log.reportErrors) {
                if (error !== undefined) {
                    captureException(error, { level: "error", extra: { message: msg } });
                }
                else {
                    captureMessage(msg, { level: "error" });
                }
            }
        }
    }
    /**
     * The kind of errors for which you should be waken up at night. Like a live backend going down.
     * You will always be immediately notified if this occurs.
     * @param {?} msg Description of the issue
     * @param {?=} error An optional error that may have arisen
     * @return {?}
     */
    static fatal(msg, error) {
        if (Log.Level <= Log.Fatal) {
            console.error(msg + (error !== undefined ? `: ${error.stack}` : ""));
            if (Log.reportErrors) {
                if (error !== undefined) {
                    //Typecast because of buggy raven js types
                    captureException(error, { level: /** @type {?} */ ("fatal"), extra: { message: msg } });
                }
                else {
                    captureMessage(msg, { level: /** @type {?} */ ("fatal") });
                }
            }
        }
    }
}
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
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
const md5Func = require("md5");
const randomBytes = require("randombytes");
const Buffer = require("buffer").Buffer;
/**
 * Functions for hashing, and encoding binary data into other formats and back again.
 */
class Crypto {
    /**
     * Calculate hash160 (ripemd160 of sha256)
     * @param {?} buffer
     * @return {?}
     */
    static hash160(buffer) {
        return crypto.hash160(buffer);
    }
    /**
     * Calculate hash256 (double sha256)
     * @param {?} buffer
     * @return {?}
     */
    static hash256(buffer) {
        return crypto.hash256(buffer);
    }
    /**
     * Calculate ripemd160
     * @param {?} buffer
     * @return {?}
     */
    static ripemd160(buffer) {
        return crypto.ripemd160(buffer);
    }
    /**
     * Calculate sha1 (Note that sha1 is unsafe nowadays!)
     * @param {?} buffer
     * @return {?}
     */
    static sha1(buffer) {
        return crypto.sha1(buffer);
    }
    /**
     * Calculate sha256 (Note that sha256 is vulnerable to length extension attacks, use hash256 instead.)
     * @param {?} buffer
     * @return {?}
     */
    static sha256(buffer) {
        return crypto.sha256(buffer);
    }
    /**
     * Calculate md5 (Note that md5 is unsafe nowadays!)
     * @param {?} buffer
     * @return {?}
     */
    static md5(buffer) {
        return Buffer.from(md5Func(buffer), "hex");
    }
    /**
     * Check if a string is valid hex code.
     * @param {?} text The text to test.
     * @return {?}
     */
    static isHex(text) {
        return text.search(/^[0-9A-Fa-f]*$/) === 0 && (text.length & 0x1) === 0;
    }
    /**
     * Turn a hex encoded string into binary data.
     * @param {?} hex
     * @return {?}
     */
    static hexToBinary(hex) {
        return Buffer.from(hex, "hex");
    }
    /**
     * Turn binary data into a hex encoded string.
     * @param {?} binary
     * @return {?}
     */
    static binaryToHex(binary) {
        return binary.toString("hex");
    }
    /**
     * Check if a string is valid base58 code.
     * @param {?} text The text to test.
     * @return {?}
     */
    static isBase58(text) {
        return text.search(/^[1-9A-HJ-NP-Za-km-z]*$/) === 0;
    }
    /**
     * Turn a base58 encoded string into binary data.
     * @param {?} base58
     * @return {?}
     */
    static base58ToBinary(base58) {
        if (base58.length === 0) {
            return Buffer.alloc(0);
        }
        const /** @type {?} */ bytes = [0];
        for (const /** @type {?} */ char of base58) {
            let /** @type {?} */ value = Crypto.base58map[char];
            if (value === undefined) {
                throw new Error("Invalid character.");
            }
            for (let /** @type {?} */ j = 0; j < bytes.length; j++) {
                value += bytes[j] * 58;
                bytes[j] = value & 0xff;
                value >>= 8;
            }
            while (value > 0) {
                bytes.push(value & 0xff);
                value >>= 8;
            }
        }
        // deal with leading zeros
        for (let /** @type {?} */ k = 0; base58[k] === Crypto.base58chars[0] && k < base58.length - 1; k++) {
            bytes.push(0);
        }
        return Buffer.from(bytes.reverse());
    }
    /**
     * Turn binary data into a base58 encoded string.
     * @param {?} binary
     * @return {?}
     */
    static binaryToBase58(binary) {
        if (binary.length === 0) {
            return "";
        }
        let /** @type {?} */ result = "";
        const /** @type {?} */ digits = [0];
        // tslint:disable-next-line:prefer-for-of Old versions don't work well with buffer it seems.
        for (let /** @type {?} */ j = 0; j < binary.length; j++) {
            let /** @type {?} */ byte = binary[j];
            for (let /** @type {?} */ i = 0; i < digits.length; i++) {
                byte += digits[i] << 8;
                digits[i] = byte % 58;
                byte = (byte / 58) | 0;
            }
            while (byte > 0) {
                digits.push(byte % 58);
                byte = (byte / 58) | 0;
            }
        }
        //Deal with leading zeros
        for (let /** @type {?} */ i = 0; binary[i] === 0 && i < binary.length - 1; i++) {
            result += Crypto.base58chars[0];
        }
        //Turn digits into characters
        for (let /** @type {?} */ i = digits.length - 1; i >= 0; i--) {
            result += Crypto.base58chars[digits[i]];
        }
        return result;
    }
    /**
     * Check if a string is valid base64 code.
     * @param {?} text The text to test.
     * @return {?}
     */
    static isBase64(text) {
        return text.search(/^[\+\/-9A-Za-z]*={0,2}$/) === 0 && (text.length & 0x3) === 0;
    }
    /**
     * Turn a base64 encoded string into binary data.
     * @param {?} base64
     * @return {?}
     */
    static base64ToBinary(base64) {
        return Buffer.from(base64, "base64");
    }
    /**
     * Turn binary data into a base64 encoded string.
     * @param {?} binary
     * @return {?}
     */
    static binaryToBase64(binary) {
        return binary.toString("base64");
    }
    /**
     * Check if a string is valid utf8 as far as postgres is concerned.
     * @param {?} text The text to test.
     * @return {?}
     */
    static isUtf8Postgres(text) {
        return text.indexOf("\0") === -1;
    }
    /**
     * Turn a text into for postgres valid utf8 text by removing invalid characters.
     * @param {?} text The text to transform.
     * @return {?}
     */
    static makeUtf8Postgres(text) {
        return text.replace("\0", "");
    }
    /**
     * Turn an utf8 string into binary data.
     * @param {?} text
     * @return {?}
     */
    static utf8ToBinary(text) {
        return Buffer.from(text, "utf8");
    }
    /**
     * Turn binary data into an utf8 string.
     * @param {?} binary
     * @return {?}
     */
    static binaryToUtf8(binary) {
        return binary.toString("utf8");
    }
    /**
     * Turn a javascript number into binary data (Only valid for numbers 0-255, will throw an error otherwise).
     * @param {?} unsignedInt
     * @return {?}
     */
    static uInt8ToBinary(unsignedInt) {
        const /** @type {?} */ buffer = Buffer.alloc(1);
        buffer.writeUInt8(unsignedInt, 0);
        return buffer;
    }
    /**
     * Turn 1 byte of binary data into a javascript number. Will throw an error if it cannot be converted.
     * @param {?} buffer
     * @return {?}
     */
    static binaryToUInt8(buffer) {
        return buffer.readUInt8(0);
    }
    /**
     * Turn a javascript number into binary data (Only valid for numbers 0-(2^16-1), will throw an error otherwise).
     * @param {?} unsignedInt
     * @return {?}
     */
    static uInt16ToBinary(unsignedInt) {
        const /** @type {?} */ buffer = Buffer.alloc(2);
        buffer.writeUInt16LE(unsignedInt, 0);
        return buffer;
    }
    /**
     * Turn 2 bytes of binary data into a javascript number. Will throw an error if it cannot be converted.
     * @param {?} buffer
     * @return {?}
     */
    static binaryToUInt16(buffer) {
        return buffer.readUInt16LE(0);
    }
    /**
     * Turn a javascript number into binary data (Only valid for numbers 0-(2^32-1), will throw an error otherwise).
     * @param {?} unsignedInt
     * @return {?}
     */
    static uInt32ToBinary(unsignedInt) {
        const /** @type {?} */ buffer = Buffer.alloc(4);
        buffer.writeUInt32LE(unsignedInt, 0);
        return buffer;
    }
    /**
     * Turn 4 bytes of binary data into a javascript number. Will throw an error if it cannot be converted.
     * @param {?} buffer
     * @return {?}
     */
    static binaryToUInt32(buffer) {
        return buffer.readUInt32LE(0);
    }
    /**
     * Turn a javascript number into binary data (Only valid for numbers 0-(2^53-1), will throw an error otherwise).
     * @param {?} ulong
     * @return {?}
     */
    static uLongToBinary(ulong) {
        //A normal long is 64 bits, not 53, but javascript only allows 53 bits accuracy.
        if (!Number.isSafeInteger(ulong) || ulong < 0) {
            throw new Error("Invalid number.");
        }
        const /** @type {?} */ buffer = Buffer.allocUnsafe(8);
        buffer.writeUInt32LE(ulong % 4294967296, 0);
        buffer.writeUInt32LE(ulong / 4294967296, 4);
        return buffer;
    }
    /**
     * Turn binary data into a javascript number. Will throw an error if it cannot be converted.
     * @param {?} binary
     * @return {?}
     */
    static binaryToULong(binary) {
        const /** @type {?} */ result = binary.readUInt32LE(0) + binary.readUInt32LE(4) * 4294967296;
        if (!Number.isSafeInteger(result)) {
            throw new Error("Invalid binary data.");
        }
        return result;
    }
    /**
     * Generate a random 16 bytes of data.
     * @return {?}
     */
    static id() {
        try {
            //It will throw an error if no good random source can be found.
            return randomBytes(16);
        }
        catch (_a) {
            //Use a less random source, which is good enough as security doesn't depend on it.
            //We use use a better random to ensure there are no collisions.
            let /** @type {?} */ result = "";
            for (let /** @type {?} */ i = 0; i < 4; i++) {
                result += (Math.random() * 16).toString(16).slice(2, 10);
            }
            return Crypto.hexToBinary(result);
        }
    }
}
Crypto.base58chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
Crypto.base58map = Object.keys(Crypto.base58chars).reduce(
// @dynamic Make the angular compiler stop complaining
(obj, key) => (obj[Crypto.base58chars[parseInt(key, 10)]] = parseInt(key, 10), obj), {});

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * This class saves key-value pairs.
 * Similar to the ES6 Map, but compatile with older browsers.
 * @template T
 */
class StringMap {
    constructor() {
        this.map = {};
    }
    /**
     * Add all elements from an object, overwriting current values if \@param overwrite is true (default).
     * @this {?}
     * @param {?} object The array of key-value pairs to add from.
     * @param {?=} overwrite Should intersecting elements be overwritten or not.
     * @return {?}
     */
    setFromObject(object, overwrite = true) {
        for (const /** @type {?} */ key of Object.keys(object)) {
            if (overwrite || !this.has(key)) {
                this.map[key] = object[key];
            }
        }
        return this;
    }
    /**
     * Add all elements from another map, overwriting current values if \@param overwrite is true (default).
     * @this {?}
     * @param {?} map The map to add from.
     * @param {?=} overwrite Should intersecting elements be overwritten or not.
     * @return {?}
     */
    setFromMap(map, overwrite = true) {
        for (const /** @type {?} */ key of map.keys()) {
            if (overwrite || !this.has(key)) {
                this.map[key] = map.get(key);
            }
        }
        return this;
    }
    /**
     * Get the value associated with a certain key (or undefined if it does not exist).
     * @param {?} key the key
     * @return {?}
     */
    get(key) {
        //https://github.com/Microsoft/TypeScript/issues/9619 Add undefined if there is a solution
        return this.map[key];
    }
    /**
     * Set the value associated with a certain key.
     * @this {?}
     * @param {?} key the key
     * @param {?} value the value
     * @return {?}
     */
    set(key, value) {
        this.map[key] = value;
        return this;
    }
    /**
     * Check if the Map contains a certain key-value pair.
     * @param {?} key the key of the key-value pair
     * @return {?}
     */
    has(key) {
        return this.map.hasOwnProperty(key);
    }
    /**
     * Delete a key-value pair.
     * @this {?}
     * @param {?} key the key
     * @return {?}
     */
    delete(key) {
        delete this.map[key];
        return this;
    }
    /**
     * Get a list of all keys in this Map.
     * @return {?}
     */
    keys() {
        return Object.keys(this.map);
    }
    /**
     * Get a list of all values in this Map.
     * @return {?}
     */
    values() {
        const /** @type {?} */ result = [];
        for (const /** @type {?} */ key of Object.keys(this.map)) {
            result.push(this.map[key]);
        }
        return result;
    }
    /**
     * Get the total amount of key-value pairs in this Map.
     * @return {?}
     */
    size() {
        return Object.keys(this.map).length;
    }
    /**
     * Remove all values from this Map.
     * @this {?}
     * @return {?}
     */
    clear() {
        for (const /** @type {?} */ key of Object.keys(this.map)) {
            delete this.map[key];
        }
        return this;
    }
    /**
     * Get a list of all key-value pairs in this Map.
     * @return {?}
     */
    entries() {
        return Object.assign({}, this.map);
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
/**
 * Classical Observable class
 * Generics are used to make it clear what data can be forwarded to observers.
 * @template T
 */
class VObservable {
    constructor() {
        this.observers = new Array();
        this.changed = false;
    }
    /**
     * Add observer to the list of observers
     * @param {?} o The observer to add
     * @return {?}
     */
    addObserver(o) {
        if (this.observers.indexOf(o) === -1) {
            this.observers.push(o);
        }
    }
    /**
     * Check if this has a certain observer.
     * @param {?} o the observer to check
     * @return {?}
     */
    hasObserver(o) {
        return this.observers.indexOf(o) !== -1;
    }
    /**
     * Indicates that the object is no longer changed
     * @return {?}
     */
    clearChanged() {
        this.changed = false;
    }
    /**
     * Return the number of active observers
     * @return {?}
     */
    countObservers() {
        return this.observers.length;
    }
    /**
     * Delete given observer
     * @param {?} o The observer to delete
     * @return {?}
     */
    deleteObserver(o) {
        const /** @type {?} */ index = this.observers.indexOf(o);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }
    /**
     * See if this element has changed
     * @return {?}
     */
    hasChanged() {
        return this.changed;
    }
    /**
     * Notify all listening observers when something has changed
     * @param {?=} arg (optional) additional argument to pass on
     * @return {?}
     */
    notifyObservers(arg) {
        // Make sure there are changes to notify
        if (this.hasChanged()) {
            // Call all observers
            for (const /** @type {?} */ observer of this.observers) {
                observer.update(this, arg);
            }
            // Clear changed
            this.clearChanged();
        }
    }
    /**
     * Object contents have changed
     * It is now possible to notify observers
     * @return {?}
     */
    setChanged() {
        this.changed = true;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
const Buffer$1 = require("buffer").Buffer;
/** @enum {number} */
const Connected = { Yes: 0, NoJustStarted: 1, NoDisconnected: 2, NoCrashed: 3, NoNotSupported: 4, };
Connected[Connected.Yes] = "Yes";
Connected[Connected.NoJustStarted] = "NoJustStarted";
Connected[Connected.NoDisconnected] = "NoDisconnected";
Connected[Connected.NoCrashed] = "NoCrashed";
Connected[Connected.NoNotSupported] = "NoNotSupported";
/**
 * @record
 */

/**
 * The Client is used to interact with the Server.
 * Observe the Client to keep updated about the connection status and incomming push messages.
 */
class Client extends VObservable {
    constructor() {
        super();
        this.signMethod = "hash256-ecdsa-compact";
        this.reconnectTimeout = 5000;
        this.maxReconnectTimeout = 60000;
        this.isInitialized = false;
        this.connected = Connected.NoJustStarted;
        this.timeout = 5000;
        this.requestResponseMap = new StringMap();
    }
    /**
     * Get this instance.
     * @return {?}
     */
    static get() {
        if (this.instance === undefined) {
            this.instance = new Client();
        }
        return this.instance;
    }
    /**
     * Initialize this instance. Once it is initialized it will connect to the server.
     * @param {?} signPrefix The prefix used for signing transactions
     * @param {?} serviceURL The url of the server for reading.
     * @param {?=} processURL The url of the server for new transactions.
     * @param {?=} signMethod The method used for signing transactions
     * @param {?=} reconnectTimeout The timeout before trying to reconnect should it disconnect.
     * Note that it is a bit randomized to prevent all client from connecting at the same time after a crash.
     * @param {?=} maxReconnectTimeout It will slowly increase timeout if connecting fails, this is the maximum it is allowed to reach.
     * @return {?}
     */
    init(signPrefix, serviceURL, processURL = serviceURL, signMethod = "hash256-ecdsa-compact", reconnectTimeout = 5000, maxReconnectTimeout = 60000) {
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
            if (this.processURL !== this.serviceURL && /** @type {?} */ ((this.processURL)).slice(0, 4) !== "http") {
                throw new Error("processURL should be the same as serviceURL or a http(s) url");
            }
            this.signPrefix = Crypto.utf8ToBinary(signPrefix);
            this.signMethod = signMethod;
            this.reconnectTimeout = reconnectTimeout;
            this.maxReconnectTimeout = maxReconnectTimeout;
            this.createWebsocket();
        }
    }
    /**
     * Get whether there currently is a connection to the backend. 0 = yes, 1+ = no for various reasons.
     * @return {?}
     */
    isConnected() {
        return this.connected;
    }
    /**
     * Helper to sign data with a private key for contract.
     * @param {?} toSign
     * @param {?} privateKey
     * @param {?=} method
     * @return {?}
     */
    sign(toSign, privateKey, method) {
        let /** @type {?} */ result;
        //Currently we only support one signing method.
        switch (method) {
            case "hash256-ecdsa-compact":
            default:
                result = privateKey.sign(toSign);
        }
        return result;
    }
    /**
     * Combines the query("contracts"), signAndSend() and getProcessedTx() methods.
     * @param {?} privateKey
     * @param {?} contractName
     * @param {?} payload
     * @param {?=} validTill
     * @return {?}
     */
    processTx(privateKey, contractName, payload, validTill = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            //Will throw an error if it failed to retrieve the contracts. (Which we don't catch but directly forward.)
            const /** @type {?} */ contracts = yield this.query("contracts", undefined, true);
            //We managed to get the contracts
            for (const /** @type {?} */ contract of contracts) {
                if (contract.type === contractName) {
                    if (Object.keys(contract.template).length !== Object.keys(payload).length) {
                        throw new Error("Payload not valid for contract.");
                    }
                    for (const /** @type {?} */ key of Object.keys(contract.template)) {
                        if ((/** @type {?} */ (payload))[key] === undefined) {
                            throw new Error("Payload not valid for contract.");
                        }
                    }
                    const /** @type {?} */ id = Crypto.id();
                    try {
                        yield this.signAndSend(privateKey, id, Crypto.hexToBinary(contract.hash), payload, validTill);
                        try {
                            return yield this.getProcessedTx(id);
                        }
                        catch (/** @type {?} */ error2) {
                            throw new Error(`Transaction delivered, but unable to determine status: ${error2.message}`);
                        }
                    }
                    catch (/** @type {?} */ error) {
                        throw new Error(`Failed to deliver transaction: ${error.message}`);
                    }
                }
            }
            throw new Error("Contract does not exist (anymore).");
        });
    }
    /**
     * Sign a transaction and send it to be processed.
     * @param {?} privateKey The private key used for signing
     * @param {?} transactionId Id of the transaction (use Crypto.id() to generate a random one)
     * @param {?} contractHash Hash of the contract
     * @param {?} payload A payload json
     * @param {?=} validTill Till when the transaction is valid (milliseconds since unix epoch), 0 = always
     * Once a block with a processed time greater than this is created it is no longer valid, but as creating
     * a block takes some time the block it is in may be processed just after the validTill.
     * @return {?}
     */
    signAndSend(privateKey, transactionId, contractHash, payload, validTill = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isInitialized) {
                throw new Error("Coinversable is not initialized.");
            }
            const /** @type {?} */ binaryTx = Buffer$1.concat([
                Crypto.uInt8ToBinary(1),
                transactionId,
                contractHash,
                Crypto.uLongToBinary(validTill),
                Crypto.utf8ToBinary(JSON.stringify(payload))
            ]);
            const /** @type {?} */ publicKey = privateKey.getPublicKey();
            const /** @type {?} */ signature = this.sign(Buffer$1.concat([/** @type {?} */ ((this.signPrefix)), binaryTx]), privateKey, this.signMethod);
            //Create the format request
            const /** @type {?} */ request = {
                base64tx: Crypto.binaryToBase64(Buffer$1.concat([
                    Crypto.uInt32ToBinary(binaryTx.length + publicKey.length + signature.length),
                    binaryTx,
                    signature,
                    publicKey
                ])),
                createTs: Date.now()
            };
            return this.query("process", request, true);
        });
    }
    /**
     * Get a transaction once it has been processed (which may take a while).
     * @param {?} transactionId
     * @return {?}
     */
    getProcessedTx(transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => new Helper(transactionId, resolve, reject));
        });
    }
    /**
     * @param {?} type
     * @param {?=} data
     * @param {?=} quickFail
     * @return {?}
     */
    query(type, data, quickFail = false) {
        return __awaiter(this, void 0, void 0, function* () {
            //If we only post a transaction we won't setup a websocket connection, but just send it.
            if (type === "process" && (this.processURL !== this.serviceURL || !this.isInitialized)) {
                if (!this.isInitialized) {
                    throw new Error("Coinversable not initialized");
                }
                else {
                    return new Promise((resolve, reject) => {
                        const /** @type {?} */ restRequest = new XMLHttpRequest();
                        restRequest.onreadystatechange = () => {
                            if (restRequest.readyState === 4) {
                                if (restRequest.status === 200) {
                                    resolve(restRequest.responseText);
                                }
                                else {
                                    reject(restRequest.responseText !== "" ? restRequest.responseText : "Failed to connect.");
                                }
                            }
                        };
                        restRequest.open("POST", /** @type {?} */ ((this.processURL)) + "process", true);
                        restRequest.send(JSON.stringify(data));
                    });
                }
            }
            const /** @type {?} */ id = Crypto.binaryToHex(Crypto.id());
            const /** @type {?} */ request = {
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
                    }
                    else {
                        //Mark it to be resend once it connects again
                        return new Promise((resolve, reject) => this.requestResponseMap.set(id, { type, data, resolve, reject }));
                    }
                }
                else {
                    //If there was a crash do not try again, could be our request was responsible for that.
                    throw new Error("Connection to backend crashed.");
                }
            }
            const /** @type {?} */ requestString = JSON.stringify(request);
            Log.debug(`Request: ${requestString}`);
            this.webSocket.send(requestString);
            //Await response
            return new Promise((resolve, reject) => this.requestResponseMap.set(id, { type, data, resolve, reject }));
        });
    }
    /**
     * Create a new websocket after initializing or losing connection.
     * @return {?}
     */
    createWebsocket() {
        //Create a websocket
        this.webSocket = new WebSocket(/** @type {?} */ ((this.serviceURL)));
        //When it opens.
        this.webSocket.onopen = () => {
            //Mark as connected again before resending outstanding requests
            this.connected = Connected.Yes;
            //Resend outstanding requests (in case of a crash they are removed already)
            for (const /** @type {?} */ key of this.requestResponseMap.keys()) {
                const /** @type {?} */ requestMap = this.requestResponseMap.get(key);
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
            let /** @type {?} */ response;
            try {
                response = JSON.parse(message.data);
            }
            catch (/** @type {?} */ error) {
                Log.warn(`Message data: ${message.data}`);
                Log.error("Received message is not valid json.", error);
                return;
            }
            if (response.id !== undefined) {
                Log.debug(`Response: ${message.data}`);
                const /** @type {?} */ responseMap = this.requestResponseMap.get(response.id);
                if (responseMap !== undefined) {
                    if (response.error !== undefined) {
                        responseMap.reject(new Error(response.error));
                    }
                    else {
                        responseMap.resolve(response.data);
                    }
                    //Remove it from the list of outstanding requests
                    this.requestResponseMap.delete(response.id);
                }
                else {
                    Log.warn(`Received response to unknown request: ${message.data}`);
                }
            }
            else {
                Log.debug(`Push: ${message.data}`);
                if (response.error === undefined && typeof response.pushType === "string") {
                    this.setChanged();
                    this.notifyObservers({
                        type: response.pushType,
                        data: response.data
                    });
                }
                else {
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
            }
            else if (ev.code === 4100) {
                //Any outstanding requests will be canceled
                for (const /** @type {?} */ requestKey of this.requestResponseMap.keys()) {
                    this.requestResponseMap.get(requestKey).reject(new Error("Version of api not supported."));
                    this.requestResponseMap.delete(requestKey);
                }
                //Version of the api not supported
                this.connected = Connected.NoNotSupported;
                this.setChanged();
            }
            else {
                if (this.connected === Connected.Yes) {
                    //Log and delete outstanding requests
                    for (const /** @type {?} */ requestKey of this.requestResponseMap.keys()) {
                        const /** @type {?} */ data = this.requestResponseMap.get(requestKey).data;
                        Log.warn(`Outstanding requests: ${requestKey}: type: ${this.requestResponseMap.get(requestKey).type} ` +
                            `data: ${data !== undefined ? JSON.stringify(data) : undefined}`);
                        this.requestResponseMap.get(requestKey).reject(new Error("Connection to backend crashed."));
                        this.requestResponseMap.delete(requestKey);
                    }
                    Log.error("Error in websocket connection, reconnecting in a moment...");
                    this.connected = Connected.NoCrashed;
                    this.setChanged();
                }
                else if (this.connected === Connected.NoJustStarted) {
                    Log.info("Failed to connect, trying again in a moment...");
                }
                else {
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
//Singleton instance
Client.instance = undefined;
/**
 * Helper class to wait till a transaction has been processed before calling the callback.
 */
class Helper {
    /**
     * @param {?} id
     * @param {?} resolve
     * @param {?} reject
     */
    constructor(id, resolve, reject) {
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
    /**
     * @param {?} _
     * @param {?=} arg
     * @return {?}
     */
    update(_, arg) {
        if (typeof arg === "object" && arg.type === "transaction" && (/** @type {?} */ (arg.data)).id === this.id) {
            Client.get().deleteObserver(this);
            this.resolve(/** @type {?} */ (arg.data));
        }
        else if (arg === Connected.Yes) {
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
const Buffer$2 = require("buffer").Buffer;
/**
 * A public key. We use and accept compressed keys only.
 */
class PublicKey {
    /**
     * Create a new public key from a buffer. Will throw an error if the buffer is not a valid public key.
     * @param {?} publicKey
     */
    constructor(publicKey) {
        if (publicKey instanceof Buffer$2) {
            this.key = ECPair.fromPublicKeyBuffer(publicKey, networks.bitcoin);
        }
        else if (publicKey instanceof ECPair) {
            this.key = publicKey;
        }
        else {
            throw new Error("Invalid type for public key");
        }
        if (!this.key.compressed) {
            throw new Error("Only compressed keys are supported.");
        }
    }
    /**
     * Check if a public key is valid or not. We accept only compressed public keys.
     * @return {?}
     */
    getPublicKey() {
        return this.key.getPublicKeyBuffer();
    }
    /**
     * Check if a public key is valid or not. We accept only compressed public keys.
     * @param {?} publicKey
     * @return {?}
     */
    static isValidPublic(publicKey) {
        try {
            return ECPair.fromPublicKeyBuffer(publicKey, networks.bitcoin).compressed;
        }
        catch (_a) {
            return false;
        }
    }
    /**
     * Check if an address is valid or not. Only prefix 0 is accepted.
     * @param {?} address
     * @return {?}
     */
    static isValidAddress(address) {
        if (typeof address !== "string") {
            return false;
        }
        try {
            const /** @type {?} */ decodedAddress = Crypto.base58ToBinary(address);
            const /** @type {?} */ checksum = decodedAddress.slice(-4);
            return decodedAddress[0] === 0x00 && Crypto.hash256(decodedAddress.slice(0, -4)).slice(0, 4).equals(checksum);
        }
        catch (_a) {
            return false;
        }
    }
    /**
     * Get the address of this public key. We use the address of the compressed key with prefix 0.
     * @return {?}
     */
    getAddress() {
        if (this.address === undefined) {
            this.address = this.key.getAddress();
        }
        return this.address;
    }
    /**
     * Verify a message and its signature against a public key. Will throw an error if any of the input values is not valid.
     * @param {?} publicKey
     * @param {?} hash
     * @param {?} signature
     * @return {?}
     */
    static verify(publicKey, hash, signature) {
        return ECPair.fromPublicKeyBuffer(publicKey, networks.bitcoin).verify(hash, ECSignature.parseCompact(Buffer$2.concat([Crypto.uInt8ToBinary(27), signature])).signature);
    }
}
/**
 * A private key.
 * Technical info: Only the secp256k1 curve is supported, We use compressed
 * wif prefix 0x80 (same as bitcoin) by default, but accept all others.
 */
class PrivateKey extends PublicKey {
    /**
     * @param {?} privateKey
     */
    constructor(privateKey) {
        super(privateKey);
    }
    /**
     * Generate a new random private key. An error will be thrown if no suitable random source is available.
     * @return {?}
     */
    static generate() {
        return new PrivateKey(ECPair.makeRandom({ compressed: true, network: networks.bitcoin }));
    }
    /**
     * Check if a WIF is valid or not. Only compressed wifs with prefix 0x80 are accepted.
     * @param {?} wif
     * @return {?}
     */
    static isValidWIF(wif) {
        try {
            return ECPair.fromWIF(wif, networks.bitcoin).compressed;
        }
        catch (/** @type {?} */ error) {
            return false;
        }
    }
    /**
     * Get the wif of this private key.
     * By default it will use the same format it was imported in.
     * If it was generated by generate() this will be compressed with network prefix 0x80
     * @return {?}
     */
    toWIF() {
        return this.key.toWIF();
    }
    /**
     * Turn a WIF into a private key. Throws an error if wif is not a valid private key.
     * @param {?} wif
     * @return {?}
     */
    static fromWIF(wif) {
        const /** @type {?} */ privateKey = ECPair.fromWIF(wif, networks.bitcoin);
        if (!privateKey.compressed) {
            throw new Error("Only compressed keys are supported.");
        }
        return new PrivateKey(privateKey);
    }
    /**
     * Sign data with this private key. Returns the signature as 32 bytes r followed by 32 bytes s.
     * @param {?} data
     * @return {?}
     */
    sign(data) {
        return this.key.sign(Crypto.hash256(data)).toCompact(0, false).slice(1);
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Generated bundle index. Do not edit.
 */

export { Client, Connected, PrivateKey, PublicKey, Crypto, StringMap, Log, VObservable };
//# sourceMappingURL=validana-client.js.map
