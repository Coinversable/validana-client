"use strict";
/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
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
var randomBytes = typeof window === "undefined" ? require("crypto").randomBytes :
    window.crypto !== undefined ? function (size) { return window.crypto.getRandomValues(Buffer.alloc(size)); } :
        function (size) { return window.msCrypto.getRandomValues(Buffer.alloc(size)); };
var createHash = typeof window === "undefined" ? require("crypto").createHash : require("create-hash");
var Crypto = (function () {
    function Crypto() {
    }
    Crypto.hash160 = function (buffer) {
        return Crypto.ripemd160(Crypto.sha256(buffer));
    };
    Crypto.hash256 = function (buffer) {
        return Crypto.sha256(Crypto.sha256(buffer));
    };
    Crypto.ripemd160 = function (buffer) {
        return createHash("ripemd160").update(buffer).digest();
    };
    Crypto.sha1 = function (buffer) {
        return createHash("sha1").update(buffer).digest();
    };
    Crypto.sha256 = function (buffer) {
        return createHash("sha256").update(buffer).digest();
    };
    Crypto.sha512 = function (buffer) {
        return createHash("sha512").update(buffer).digest();
    };
    Crypto.md5 = function (buffer) {
        return createHash("md5").update(buffer).digest();
    };
    Crypto.isHex = function (text) {
        return text.search(/^[0-9A-Fa-f]*$/) === 0 && text.length % 2 === 0;
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
        var e_1, _a;
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
                for (var i = 0; i < bytes.length; i++) {
                    value += bytes[i] * 58;
                    bytes[i] = value & 0xff;
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
                if (base58_1_1 && !base58_1_1.done && (_a = base58_1.return)) _a.call(base58_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        for (var i = 0; base58[i] === Crypto.base58chars[0] && i < base58.length - 1; i++) {
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
        return text.search(/^[\+\/-9A-Za-z]*={0,2}$/) === 0 && text.length % 4 === 0;
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
    Crypto.isBase64Url = function (text) {
        return text.search(/^[\-_0-9A-Za-z]*$/) === 0 && text.length % 4 !== 1;
    };
    Crypto.base64UrlToBinary = function (base64url) {
        var pad = base64url.length % 4;
        if (pad === 3) {
            base64url = base64url + "=";
        }
        else if (pad === 2) {
            base64url = base64url + "==";
        }
        return Buffer.from(base64url.replace(/-/g, "+").replace(/_/g, "/"), "base64");
    };
    Crypto.binaryToBase64Url = function (binary) {
        return binary.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    };
    Crypto.makeUtf8Postgres = function (text) {
        return text.replace(/\0/g, "");
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
            for (var i = 0; i < 32; i++) {
                result += (Math.random() * 16 | 0).toString(16);
            }
            return Crypto.hexToBinary(result);
        }
    };
    Crypto.secureRandom = function (size) {
        return randomBytes(size);
    };
    Crypto.base58chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    Crypto.base58map = Object.keys(Crypto.base58chars).reduce(function (obj, key) { return (obj[Crypto.base58chars[Number.parseInt(key, 10)]] = Number.parseInt(key, 10), obj); }, {});
    return Crypto;
}());
exports.Crypto = Crypto;
