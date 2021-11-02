"use strict";
/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crypto = void 0;
const buffer_1 = require("buffer");
const randomBytes = typeof window === "undefined" ? require("crypto").randomBytes :
    window.crypto !== undefined ? (size) => window.crypto.getRandomValues(buffer_1.Buffer.alloc(size)) :
        (size) => window.msCrypto.getRandomValues(buffer_1.Buffer.alloc(size));
const createHash = typeof window === "undefined" ? require("crypto").createHash : require("create-hash");
class Crypto {
    static hash160(buffer) {
        return Crypto.ripemd160(Crypto.sha256(buffer));
    }
    static hash256(buffer) {
        return Crypto.sha256(Crypto.sha256(buffer));
    }
    static ripemd160(buffer) {
        return createHash("ripemd160").update(buffer).digest();
    }
    static sha1(buffer) {
        return createHash("sha1").update(buffer).digest();
    }
    static sha256(buffer) {
        return createHash("sha256").update(buffer).digest();
    }
    static sha512(buffer) {
        return createHash("sha512").update(buffer).digest();
    }
    static md5(buffer) {
        return createHash("md5").update(buffer).digest();
    }
    static isHex(text) {
        return text.search(/^[0-9A-Fa-f]*$/) === 0 && text.length % 2 === 0;
    }
    static hexToBinary(hex) {
        return buffer_1.Buffer.from(hex, "hex");
    }
    static binaryToHex(binary) {
        return binary.toString("hex");
    }
    static isBase58(text) {
        return text.search(/^[1-9A-HJ-NP-Za-km-z]*$/) === 0;
    }
    static base58ToBinary(base58) {
        if (base58.length === 0) {
            return buffer_1.Buffer.alloc(0);
        }
        const bytes = [0];
        for (const char of base58) {
            let value = Crypto.base58map[char];
            if (value === undefined) {
                throw new Error("Invalid character.");
            }
            for (let i = 0; i < bytes.length; i++) {
                value += bytes[i] * 58;
                bytes[i] = value & 0xff;
                value >>= 8;
            }
            while (value > 0) {
                bytes.push(value & 0xff);
                value >>= 8;
            }
        }
        for (let i = 0; base58[i] === Crypto.base58chars[0] && i < base58.length - 1; i++) {
            bytes.push(0);
        }
        return buffer_1.Buffer.from(bytes.reverse());
    }
    static binaryToBase58(binary) {
        if (binary.length === 0) {
            return "";
        }
        let result = "";
        const digits = [0];
        for (let j = 0; j < binary.length; j++) {
            let byte = binary[j];
            for (let i = 0; i < digits.length; i++) {
                byte += digits[i] << 8;
                digits[i] = byte % 58;
                byte = (byte / 58) | 0;
            }
            while (byte > 0) {
                digits.push(byte % 58);
                byte = (byte / 58) | 0;
            }
        }
        for (let i = 0; binary[i] === 0 && i < binary.length - 1; i++) {
            result += Crypto.base58chars[0];
        }
        for (let i = digits.length - 1; i >= 0; i--) {
            result += Crypto.base58chars[digits[i]];
        }
        return result;
    }
    static isBase64(text) {
        return text.search(/^[\+\/-9A-Za-z]*={0,2}$/) === 0 && text.length % 4 === 0;
    }
    static base64ToBinary(base64) {
        return buffer_1.Buffer.from(base64, "base64");
    }
    static binaryToBase64(binary) {
        return binary.toString("base64");
    }
    static isUtf8Postgres(text) {
        return text.indexOf("\0") === -1;
    }
    static isBase64Url(text) {
        return text.search(/^[\-_0-9A-Za-z]*$/) === 0 && text.length % 4 !== 1;
    }
    static base64UrlToBinary(base64url) {
        const pad = base64url.length % 4;
        if (pad === 3) {
            base64url = base64url + "=";
        }
        else if (pad === 2) {
            base64url = base64url + "==";
        }
        return buffer_1.Buffer.from(base64url.replace(/-/g, "+").replace(/_/g, "/"), "base64");
    }
    static binaryToBase64Url(binary) {
        return binary.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
    static makeUtf8Postgres(text) {
        return text.replace(/\0/g, "");
    }
    static utf8ToBinary(text) {
        return buffer_1.Buffer.from(text, "utf8");
    }
    static binaryToUtf8(binary) {
        return binary.toString("utf8");
    }
    static uInt8ToBinary(unsignedInt) {
        const buffer = buffer_1.Buffer.alloc(1);
        buffer.writeUInt8(unsignedInt, 0);
        return buffer;
    }
    static binaryToUInt8(buffer) {
        return buffer.readUInt8(0);
    }
    static uInt16ToBinary(unsignedInt) {
        const buffer = buffer_1.Buffer.alloc(2);
        buffer.writeUInt16LE(unsignedInt, 0);
        return buffer;
    }
    static binaryToUInt16(buffer) {
        return buffer.readUInt16LE(0);
    }
    static uInt32ToBinary(unsignedInt) {
        const buffer = buffer_1.Buffer.alloc(4);
        buffer.writeUInt32LE(unsignedInt, 0);
        return buffer;
    }
    static binaryToUInt32(buffer) {
        return buffer.readUInt32LE(0);
    }
    static uLongToBinary(ulong) {
        if (!Number.isSafeInteger(ulong) || ulong < 0) {
            throw new Error("Invalid number.");
        }
        const buffer = buffer_1.Buffer.allocUnsafe(8);
        buffer.writeUInt32LE(ulong % 4294967296, 0);
        buffer.writeUInt32LE(ulong / 4294967296, 4);
        return buffer;
    }
    static binaryToULong(binary) {
        const result = binary.readUInt32LE(0) + binary.readUInt32LE(4) * 4294967296;
        if (!Number.isSafeInteger(result)) {
            throw new Error("Invalid binary data.");
        }
        return result;
    }
    static id() {
        try {
            return randomBytes(16);
        }
        catch (error) {
            let result = "";
            for (let i = 0; i < 32; i++) {
                result += (Math.random() * 16 | 0).toString(16);
            }
            return Crypto.hexToBinary(result);
        }
    }
    static secureRandom(size) {
        return randomBytes(size);
    }
}
exports.Crypto = Crypto;
Crypto.base58chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
Crypto.base58map = Object.keys(Crypto.base58chars).reduce((obj, key) => (obj[Crypto.base58chars[Number.parseInt(key, 10)]] = Number.parseInt(key, 10), obj), {});
