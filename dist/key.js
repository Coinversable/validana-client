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
Object.defineProperty(exports, "__esModule", { value: true });
var Buffer = require("buffer").Buffer;
var crypto_1 = require("./tools/crypto");
var ecurve = require("ecurve");
var bigi = require("bigi");
var PublicKey = (function () {
    function PublicKey(publicKey) {
        if (!PublicKey.isValidPublic(publicKey)) {
            throw new Error("Invalid public key format.");
        }
        this.publicKey = publicKey;
    }
    PublicKey.isValidPublic = function (publicKey) {
        if (!(publicKey instanceof Buffer) || publicKey.length !== 33 || (publicKey[0] !== 0x02 && publicKey[0] !== 0x03)) {
            return false;
        }
        try {
            var point = ecurve.Point.decodeFrom(PublicKey.secp256k1, publicKey);
            return PublicKey.secp256k1.validate(point) && point.x.compareTo(PublicKey.secp256k1.p) < 0 && point.y.compareTo(PublicKey.secp256k1.p) < 0;
        }
        catch (error) {
            return false;
        }
    };
    PublicKey.isValidAddress = function (address) {
        if (typeof address === "string") {
            try {
                var decodedAddress = crypto_1.Crypto.base58ToBinary(address);
                var checksum = decodedAddress.slice(-4);
                return decodedAddress.length === 25 && decodedAddress[0] === 0x00 && crypto_1.Crypto.hash256(decodedAddress.slice(0, -4)).slice(0, 4).equals(checksum);
            }
            catch (_a) {
                return false;
            }
        }
        else if (address instanceof Buffer) {
            return address.length === 20;
        }
        else {
            return false;
        }
    };
    PublicKey.prototype.getAddress = function () {
        if (this.address === undefined) {
            var hashedAddress = Buffer.concat([crypto_1.Crypto.uInt8ToBinary(0x00), crypto_1.Crypto.hash160(this.publicKey)]);
            var checksum = crypto_1.Crypto.hash256(hashedAddress).slice(0, 4);
            this.address = crypto_1.Crypto.binaryToBase58(Buffer.concat([hashedAddress, checksum]));
        }
        return this.address;
    };
    PublicKey.prototype.getAddressAsBuffer = function () {
        return crypto_1.Crypto.hash160(this.publicKey);
    };
    PublicKey.addressAsBuffer = function (address) {
        if (!PublicKey.isValidAddress(address)) {
            throw new Error("Invalid address.");
        }
        if (typeof address === "string") {
            return crypto_1.Crypto.base58ToBinary(address).slice(1, -4);
        }
        else {
            return address;
        }
    };
    PublicKey.addressAsString = function (address) {
        if (!PublicKey.isValidAddress(address)) {
            throw new Error("Invalid address.");
        }
        if (typeof address === "string") {
            return address;
        }
        else {
            var hashedAddress = Buffer.concat([crypto_1.Crypto.uInt8ToBinary(0x00), address]);
            var checksum = crypto_1.Crypto.hash256(hashedAddress).slice(0, 4);
            return crypto_1.Crypto.binaryToBase58(Buffer.concat([hashedAddress, checksum]));
        }
    };
    PublicKey.prototype.verify = function (data, signature) {
        if (!(data instanceof Buffer) || !(signature instanceof Buffer) || signature.length !== 64) {
            throw new Error("Invalid data or signature format.");
        }
        var n = PublicKey.secp256k1.n;
        var r = bigi.fromBuffer(signature.slice(0, 32));
        var s = bigi.fromBuffer(signature.slice(32));
        if (r.signum() <= 0 || r.compareTo(n) >= 0) {
            return false;
        }
        if (s.signum() <= 0 || s.compareTo(n) >= 0) {
            return false;
        }
        var e = crypto_1.Crypto.hash256(data);
        var z = bigi.fromBuffer(e);
        var w = s.modInverse(n);
        var u1 = z.multiply(w).mod(n);
        var u2 = r.multiply(w).mod(n);
        var xy = PublicKey.secp256k1.G.multiplyTwo(u1, ecurve.Point.decodeFrom(PublicKey.secp256k1, this.publicKey), u2);
        if (PublicKey.secp256k1.isInfinity(xy)) {
            return false;
        }
        return xy.affineX.mod(n).equals(r);
    };
    PublicKey.secp256k1 = ecurve.getCurveByName("secp256k1");
    return PublicKey;
}());
exports.PublicKey = PublicKey;
var PrivateKey = (function (_super) {
    __extends(PrivateKey, _super);
    function PrivateKey(privateKey, publicKey) {
        var _this = this;
        if (publicKey === undefined) {
            publicKey = PublicKey.secp256k1.G.multiply(bigi.fromBuffer(privateKey)).getEncoded(true);
        }
        _this = _super.call(this, publicKey) || this;
        _this.privateKey = privateKey;
        return _this;
    }
    PrivateKey.generate = function () {
        var privkeyBuffer;
        var privkey;
        do {
            privkeyBuffer = crypto_1.Crypto.secureRandom(32);
            privkey = bigi.fromBuffer(privkeyBuffer);
        } while (privkey.signum() <= 0 || privkey.compareTo(PublicKey.secp256k1.n) >= 0);
        return new PrivateKey(privkeyBuffer);
    };
    PrivateKey.generateNonRandom = function (data, salt) {
        var privateKey = crypto_1.Crypto.hash256(Buffer.concat([data, salt]));
        var success = false;
        while (!success) {
            var privkey = bigi.fromBuffer(privateKey);
            success = privkey.signum() > 0 && privkey.compareTo(PublicKey.secp256k1.n) < 0;
            if (!success) {
                privateKey = crypto_1.Crypto.hash256(Buffer.concat([privateKey, salt]));
            }
        }
        return new PrivateKey(privateKey);
    };
    PrivateKey.isValidWIF = function (wif) {
        if (typeof wif !== "string" || !crypto_1.Crypto.isBase58(wif)) {
            return false;
        }
        var decodedWif = crypto_1.Crypto.base58ToBinary(wif);
        if (decodedWif.length !== 38 || decodedWif[0] !== 0x80 || decodedWif[33] !== 0x01) {
            return false;
        }
        var checksum = decodedWif.slice(-4);
        if (!crypto_1.Crypto.hash256(decodedWif.slice(0, -4)).slice(0, 4).equals(checksum)) {
            return false;
        }
        var privkey = bigi.fromBuffer(decodedWif.slice(1, 33));
        if (privkey.signum() <= 0 || privkey.compareTo(PublicKey.secp256k1.n) >= 0) {
            return false;
        }
        return true;
    };
    PrivateKey.prototype.toWIF = function () {
        var mainNetKey = Buffer.concat([crypto_1.Crypto.uInt8ToBinary(0x80), this.privateKey, crypto_1.Crypto.uInt8ToBinary(0x01)]);
        var checkSum = crypto_1.Crypto.hash256(mainNetKey).slice(0, 4);
        return crypto_1.Crypto.binaryToBase58(Buffer.concat([mainNetKey, checkSum]));
    };
    PrivateKey.fromWIF = function (wif) {
        if (!PrivateKey.isValidWIF(wif)) {
            throw new Error("Invalid wif");
        }
        return new PrivateKey(crypto_1.Crypto.base58ToBinary(wif).slice(1, 33));
    };
    PrivateKey.prototype.sign = function (data) {
        if (!(data instanceof Buffer)) {
            throw new Error("Invalid data format");
        }
        var n = PublicKey.secp256k1.n;
        var e = crypto_1.Crypto.hash256(data);
        var z = bigi.fromBuffer(e);
        var k;
        var r;
        var s;
        while (true) {
            k = bigi.fromBuffer(crypto_1.Crypto.secureRandom(32));
            if (k.signum() <= 0 || k.compareTo(n) >= 0) {
                continue;
            }
            var xy = PublicKey.secp256k1.G.multiply(k);
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
        return Buffer.concat([r.toBuffer(32), s.toBuffer(32)]);
    };
    return PrivateKey;
}(PublicKey));
exports.PrivateKey = PrivateKey;
