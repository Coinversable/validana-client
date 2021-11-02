"use strict";
/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivateKey = exports.PublicKey = void 0;
const ecurve = require("ecurve");
const bigi = require("bigi");
const buffer_1 = require("buffer");
const crypto_1 = require("./tools/crypto");
class PublicKey {
    constructor(publicKey) {
        if (!PublicKey.isValidPublic(publicKey)) {
            throw new Error("Invalid public key format.");
        }
        this.publicKey = publicKey;
    }
    static isValidPublic(publicKey) {
        if (!(buffer_1.Buffer.isBuffer(publicKey)) || publicKey.length !== 33 || (publicKey[0] !== 0x02 && publicKey[0] !== 0x03)) {
            return false;
        }
        try {
            const point = ecurve.Point.decodeFrom(PublicKey.secp256k1, publicKey);
            return PublicKey.secp256k1.validate(point) && point.x.compareTo(PublicKey.secp256k1.p) < 0 && point.y.compareTo(PublicKey.secp256k1.p) < 0;
        }
        catch (error) {
            return false;
        }
    }
    static isValidAddress(address) {
        if (typeof address === "string") {
            try {
                const decodedAddress = crypto_1.Crypto.base58ToBinary(address);
                const checksum = decodedAddress.slice(-4);
                return decodedAddress.length === 25 && decodedAddress[0] === 0x00 && crypto_1.Crypto.hash256(decodedAddress.slice(0, -4)).slice(0, 4).equals(checksum);
            }
            catch (error) {
                return false;
            }
        }
        else if (buffer_1.Buffer.isBuffer(address)) {
            return address.length === 20;
        }
        else {
            return false;
        }
    }
    getAddress() {
        if (this.address === undefined) {
            const hashedAddress = buffer_1.Buffer.concat([crypto_1.Crypto.uInt8ToBinary(0x00), crypto_1.Crypto.hash160(this.publicKey)]);
            const checksum = crypto_1.Crypto.hash256(hashedAddress).slice(0, 4);
            this.address = crypto_1.Crypto.binaryToBase58(buffer_1.Buffer.concat([hashedAddress, checksum]));
        }
        return this.address;
    }
    getAddressAsBuffer() {
        return crypto_1.Crypto.hash160(this.publicKey);
    }
    static addressAsBuffer(address) {
        if (!PublicKey.isValidAddress(address)) {
            throw new Error("Invalid address.");
        }
        if (typeof address === "string") {
            return crypto_1.Crypto.base58ToBinary(address).slice(1, -4);
        }
        else {
            return address;
        }
    }
    static addressAsString(address) {
        if (!PublicKey.isValidAddress(address)) {
            throw new Error("Invalid address.");
        }
        if (typeof address === "string") {
            return address;
        }
        else {
            const hashedAddress = buffer_1.Buffer.concat([crypto_1.Crypto.uInt8ToBinary(0x00), address]);
            const checksum = crypto_1.Crypto.hash256(hashedAddress).slice(0, 4);
            return crypto_1.Crypto.binaryToBase58(buffer_1.Buffer.concat([hashedAddress, checksum]));
        }
    }
    verify(data, signature) {
        if (!(buffer_1.Buffer.isBuffer(data)) || !(buffer_1.Buffer.isBuffer(signature)) || signature.length !== 64) {
            throw new Error("Invalid data or signature format.");
        }
        const n = PublicKey.secp256k1.n;
        const r = bigi.fromBuffer(signature.slice(0, 32));
        const s = bigi.fromBuffer(signature.slice(32));
        if (r.signum() <= 0 || r.compareTo(n) >= 0) {
            return false;
        }
        if (s.signum() <= 0 || s.compareTo(n) >= 0) {
            return false;
        }
        const e = crypto_1.Crypto.hash256(data);
        const z = bigi.fromBuffer(e);
        const w = s.modInverse(n);
        const u1 = z.multiply(w).mod(n);
        const u2 = r.multiply(w).mod(n);
        const xy = PublicKey.secp256k1.G.multiplyTwo(u1, ecurve.Point.decodeFrom(PublicKey.secp256k1, this.publicKey), u2);
        if (PublicKey.secp256k1.isInfinity(xy)) {
            return false;
        }
        return xy.affineX.mod(n).equals(r);
    }
}
exports.PublicKey = PublicKey;
PublicKey.secp256k1 = ecurve.getCurveByName("secp256k1");
class PrivateKey extends PublicKey {
    constructor(privateKey, publicKey) {
        if (publicKey === undefined) {
            publicKey = PublicKey.secp256k1.G.multiply(bigi.fromBuffer(privateKey)).getEncoded(true);
        }
        super(publicKey);
        this.privateKey = privateKey;
    }
    static generate() {
        let privkeyBuffer;
        let privkey;
        do {
            privkeyBuffer = crypto_1.Crypto.secureRandom(32);
            privkey = bigi.fromBuffer(privkeyBuffer);
        } while (privkey.signum() <= 0 || privkey.compareTo(PublicKey.secp256k1.n) >= 0);
        return new PrivateKey(privkeyBuffer);
    }
    static generateNonRandom(data, salt) {
        let privateKey = crypto_1.Crypto.hash256(buffer_1.Buffer.concat([data, salt]));
        let success = false;
        while (!success) {
            const privkey = bigi.fromBuffer(privateKey);
            success = privkey.signum() > 0 && privkey.compareTo(PublicKey.secp256k1.n) < 0;
            if (!success) {
                privateKey = crypto_1.Crypto.hash256(buffer_1.Buffer.concat([privateKey, salt]));
            }
        }
        return new PrivateKey(privateKey);
    }
    static isValidWIF(wif) {
        if (typeof wif !== "string" || !crypto_1.Crypto.isBase58(wif)) {
            return false;
        }
        const decodedWif = crypto_1.Crypto.base58ToBinary(wif);
        if (decodedWif.length !== 38 || decodedWif[0] !== 0x80 || decodedWif[33] !== 0x01) {
            return false;
        }
        const checksum = decodedWif.slice(-4);
        if (!crypto_1.Crypto.hash256(decodedWif.slice(0, -4)).slice(0, 4).equals(checksum)) {
            return false;
        }
        const privkey = bigi.fromBuffer(decodedWif.slice(1, 33));
        if (privkey.signum() <= 0 || privkey.compareTo(PublicKey.secp256k1.n) >= 0) {
            return false;
        }
        return true;
    }
    toWIF() {
        const mainNetKey = buffer_1.Buffer.concat([crypto_1.Crypto.uInt8ToBinary(0x80), this.privateKey, crypto_1.Crypto.uInt8ToBinary(0x01)]);
        const checkSum = crypto_1.Crypto.hash256(mainNetKey).slice(0, 4);
        return crypto_1.Crypto.binaryToBase58(buffer_1.Buffer.concat([mainNetKey, checkSum]));
    }
    static fromWIF(wif) {
        if (!PrivateKey.isValidWIF(wif)) {
            throw new Error("Invalid wif");
        }
        return new PrivateKey(crypto_1.Crypto.base58ToBinary(wif).slice(1, 33));
    }
    sign(data) {
        if (!(buffer_1.Buffer.isBuffer(data))) {
            throw new Error("Invalid data format");
        }
        const n = PublicKey.secp256k1.n;
        const e = crypto_1.Crypto.hash256(data);
        const z = bigi.fromBuffer(e);
        let k;
        let r;
        let s;
        while (true) {
            k = bigi.fromBuffer(crypto_1.Crypto.secureRandom(32));
            if (k.signum() <= 0 || k.compareTo(n) >= 0) {
                continue;
            }
            const xy = PublicKey.secp256k1.G.multiply(k);
            if (PublicKey.secp256k1.isInfinity(xy)) {
                continue;
            }
            r = xy.affineX.mod(n);
            if (r.signum() === 0) {
                continue;
            }
            s = k.modInverse(n).multiply(z.add(bigi.fromBuffer(this.privateKey).multiply(r))).mod(n);
            if (s.signum() === 0) {
                continue;
            }
            break;
        }
        return buffer_1.Buffer.concat([r.toBuffer(32), s.toBuffer(32)]);
    }
}
exports.PrivateKey = PrivateKey;
