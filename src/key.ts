/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */

// tslint:disable-next-line:no-var-requires
const Buffer: typeof global.Buffer = require("buffer").Buffer;
import { Crypto } from "./tools/crypto";
import * as ecurve from "ecurve";
import * as bigi from "bigi";

/** A public key. We use and accept compressed keys only. */
export class PublicKey {
	//The curve we use
	protected static readonly secp256k1 = ecurve.getCurveByName("secp256k1");

	/** The public key and address in different formats. */
	public readonly publicKey: Buffer;
	private address: string | undefined;

	/**
	 * Create a new public key from a buffer.
	 * @throws if the buffer is not a valid public key.
	 */
	constructor(publicKey: Buffer) {
		if (!PublicKey.isValidPublic(publicKey)) {
			throw new Error("Invalid public key format.");
		}
		this.publicKey = publicKey;
	}

	/** Check if a public key is valid or not. We accept only compressed public keys. */
	public static isValidPublic(publicKey: Buffer): boolean {
		if (!(publicKey instanceof Buffer) || publicKey.length !== 33 || (publicKey[0] !== 0x02 && publicKey[0] !== 0x03)) {
			return false;
		}
		try {
			const point = ecurve.Point.decodeFrom(PublicKey.secp256k1, publicKey);
			return PublicKey.secp256k1.validate(point) && point.x.compareTo(PublicKey.secp256k1.p) < 0 && point.y.compareTo(PublicKey.secp256k1.p) < 0;
		} catch (error) {
			return false;
		}
	}

	/** Check if an address is valid or not. Only prefix 0 is accepted. */
	public static isValidAddress(address: string | Buffer): boolean {
		if (typeof address === "string") {
			try {
				const decodedAddress = Crypto.base58ToBinary(address);
				const checksum = decodedAddress.slice(-4);
				return decodedAddress.length === 25 && decodedAddress[0] === 0x00 && Crypto.hash256(decodedAddress.slice(0, -4)).slice(0, 4).equals(checksum);
			} catch {
				return false;
			}
		} else if (address instanceof Buffer) {
			return address.length === 20;
		} else {
			return false;
		}
	}

	/** Get the address of this public key. We use the address of the compressed key with prefix 0. */
	public getAddress(): string {
		if (this.address === undefined) {
			const hashedAddress = Buffer.concat([Crypto.uInt8ToBinary(0x00), Crypto.hash160(this.publicKey)]);
			const checksum = Crypto.hash256(hashedAddress).slice(0, 4);
			this.address = Crypto.binaryToBase58(Buffer.concat([hashedAddress, checksum]));
		}
		return this.address;
	}

	/**
	 * Get the address of this public key as binary data.
	 * Unlike string addresses there is no checksum, nor prefix, as users are not expected to use addresses in binary format.
	 */
	public getAddressAsBuffer(): Buffer {
		return Crypto.hash160(this.publicKey);
	}

	/**
	 * Convert an address to binary format.
	 * @throws If the address is invalid.
	 */
	public static addressAsBuffer(address: string | Buffer): Buffer {
		if (!PublicKey.isValidAddress(address)) {
			throw new Error("Invalid address.");
		}
		if (typeof address === "string") {
			return Crypto.base58ToBinary(address).slice(1, -4);
		} else {
			return address;
		}
	}

	/**
	 * Convert an address to string format.
	 * @throws If the address in invalid.
	 */
	public static addressAsString(address: string | Buffer): string {
		if (!PublicKey.isValidAddress(address)) {
			throw new Error("Invalid address.");
		}
		if (typeof address === "string") {
			return address;
		} else {
			const hashedAddress = Buffer.concat([Crypto.uInt8ToBinary(0x00), address]);
			const checksum = Crypto.hash256(hashedAddress).slice(0, 4);
			return Crypto.binaryToBase58(Buffer.concat([hashedAddress, checksum]));
		}
	}

	/**
	 * Verify a message and its signature against a public key. Signature should exist of 32 bytes r followed by 32 bytes s.
	 * @throws if the data or signature have an invalid format
	 */
	public verify(data: Buffer, signature: Buffer): boolean {
		if (!(data instanceof Buffer) || !(signature instanceof Buffer) || signature.length !== 64) {
			throw new Error("Invalid data or signature format.");
		}

		const n = PublicKey.secp256k1.n;
		const r = bigi.fromBuffer(signature.slice(0, 32));
		const s = bigi.fromBuffer(signature.slice(32));

		//https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm#Signature_verification_algorithm

		//Step 1
		if (r.signum() as any <= 0 || r.compareTo(n) >= 0) {
			return false;
		}
		if (s.signum() as any <= 0 || s.compareTo(n) >= 0) {
			return false;
		}

		//Step 2
		const e = Crypto.hash256(data);
		//Step 3
		const z = bigi.fromBuffer(e);

		//Step 4
		const w = s.modInverse(n as any);

		//Step 5
		const u1 = z.multiply(w).mod(n);
		const u2 = r.multiply(w).mod(n);

		//Step 6
		const xy = PublicKey.secp256k1.G.multiplyTwo(u1, ecurve.Point.decodeFrom(PublicKey.secp256k1, this.publicKey), u2);
		if (PublicKey.secp256k1.isInfinity(xy)) {
			return false;
		}

		//Step 7
		return xy.affineX.mod(n).equals(r);
	}
}

/**
 * A private key.
 * Technical info: Only the secp256k1 curve is supported, We use compressed wif prefix 0x80 (same as bitcoin).
 */
export class PrivateKey extends PublicKey {
	/** The private key WITHOUT network or compression info. */
	public readonly privateKey: Buffer;

	//Compressed is only used if public key is not given
	private constructor(privateKey: Buffer, publicKey?: Buffer) {
		if (publicKey === undefined) {
			publicKey = PublicKey.secp256k1.G.multiply(bigi.fromBuffer(privateKey)).getEncoded(true);
		}
		super(publicKey);
		this.privateKey = privateKey;
	}

	/**
	 * Generate a new random private key.
	 * @throws If no suitable random source is available.
	 */
	public static generate(): PrivateKey {
		let privkeyBuffer: Buffer;
		let privkey: bigi;
		do {
			//Has an around 1 in 2^128 chance of being invalid
			privkeyBuffer = Crypto.secureRandom(32);
			privkey = bigi.fromBuffer(privkeyBuffer);
		} while (privkey.signum() as any <= 0 || privkey.compareTo(PublicKey.secp256k1.n) >= 0);
		return new PrivateKey(privkeyBuffer);
	}

	/** Generate a new non-random private key based on data. */
	public static generateNonRandom(data: Buffer, salt: Buffer): PrivateKey {
		let privateKey = Crypto.hash256(Buffer.concat([data, salt]));
		let success = false;
		while (!success) {
			const privkey = bigi.fromBuffer(privateKey);
			success = privkey.signum() as any > 0 && privkey.compareTo(PublicKey.secp256k1.n) < 0;
			//This should happen about 1 in 2^128 times.
			if (!success) {
				//Salt it again for safety against timing attacks.
				privateKey = Crypto.hash256(Buffer.concat([privateKey, salt]));
			}
		}
		return new PrivateKey(privateKey);
	}

	/** Check if a WIF is valid or not. Only compressed wifs with prefix 0x80 are accepted. */
	public static isValidWIF(wif: string): boolean {
		if (typeof wif !== "string" || !Crypto.isBase58(wif)) {
			//Not a string or not base58
			return false;
		}
		const decodedWif = Crypto.base58ToBinary(wif);
		if (decodedWif.length !== 38 || decodedWif[0] !== 0x80 || decodedWif[33] !== 0x01) {
			//Invalid format, we only want compressed wifs with prefix 0x80.
			return false;
		}
		const checksum = decodedWif.slice(-4);
		if (!Crypto.hash256(decodedWif.slice(0, -4)).slice(0, 4).equals(checksum)) {
			//Checksum is invalid
			return false;
		}
		const privkey = bigi.fromBuffer(decodedWif.slice(1, 33));
		if (privkey.signum() as any <= 0 || privkey.compareTo(PublicKey.secp256k1.n) >= 0) {
			//Data falls outside the curve
			return false;
		}
		return true;
	}

	/** Get the wif of this private key. */
	public toWIF(): string {
		const mainNetKey = Buffer.concat([Crypto.uInt8ToBinary(0x80), this.privateKey, Crypto.uInt8ToBinary(0x01)]);
		const checkSum = Crypto.hash256(mainNetKey).slice(0, 4);
		return Crypto.binaryToBase58(Buffer.concat([mainNetKey, checkSum]));
	}

	/**
	 * Turn a WIF into a private key.
	 * @throws If wif is not a valid private key.
	 */
	public static fromWIF(wif: string): PrivateKey {
		if (!PrivateKey.isValidWIF(wif)) {
			throw new Error("Invalid wif");
		}

		return new PrivateKey(Crypto.base58ToBinary(wif).slice(1, 33));
	}

	/** Sign data with this private key. Returns the signature as 32 bytes r followed by 32 bytes s. */
	public sign(data: Buffer): Buffer {
		if (!(data instanceof Buffer)) {
			throw new Error("Invalid data format");
		}

		const n = PublicKey.secp256k1.n;

		//https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm#Signature_generation_algorithm
		//Step 1
		const e = Crypto.hash256(data);
		//Step 2
		const z = bigi.fromBuffer(e);

		let k: bigi;
		let r: bigi;
		let s: bigi;
		while (true) {
			//Step 3
			k = bigi.fromBuffer(Crypto.secureRandom(32));
			if (k.signum() as any <= 0 || k.compareTo(n) >= 0) {
				continue;
			}
			//Step 4
			const xy = PublicKey.secp256k1.G.multiply(k);
			if (PublicKey.secp256k1.isInfinity(xy)) {
				continue;
			}
			//Step 5
			r = xy.affineX.mod(n);
			if (r.signum() as any === 0) {
				continue;
			}
			//Step 6
			s = k.modInverse(n as any).multiply(z.add(bigi.fromBuffer(this.privateKey).multiply(r))).mod(n);
			if (s.signum() as any === 0) {
				continue;
			}
			break;
		}

		//Step 7
		return Buffer.concat([r.toBuffer(32), s.toBuffer(32)]);
	}
}