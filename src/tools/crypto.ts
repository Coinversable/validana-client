/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */

// tslint:disable:no-var-requires
const Buffer: typeof global.Buffer = require("buffer").Buffer;
const randomBytes = typeof window === "undefined" ? require("crypto").randomBytes :
	window.crypto !== undefined ? (size: number) => window.crypto.getRandomValues(Buffer.alloc(size)) :
		(size: number) => (window as any).msCrypto.getRandomValues(Buffer.alloc(size));
const createHash = typeof window === "undefined" ? require("crypto").createHash : require("create-hash");

/** Functions for hashing, and encoding binary data into other formats and back again. */
export class Crypto {
	//All base 58 characters in the order they are encoded in.
	private static readonly base58chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
	//And a map of characters to position in that string.
	private static readonly base58map: { [key: string]: number } = Object.keys(Crypto.base58chars).reduce(
		(obj: { [key: string]: number }, key) => (obj[Crypto.base58chars[Number.parseInt(key, 10)]] = Number.parseInt(key, 10), obj), {});

	/** Calculate hash160 (ripemd160 of sha256) */
	public static hash160(buffer: Buffer | string): Buffer {
		return Crypto.ripemd160(Crypto.sha256(buffer));
	}

	/** Calculate hash256 (double sha256) */
	public static hash256(buffer: Buffer | string): Buffer {
		return Crypto.sha256(Crypto.sha256(buffer));
	}

	/** Calculate ripemd160 */
	public static ripemd160(buffer: Buffer | string): Buffer {
		return createHash("ripemd160").update(buffer).digest();
	}

	/** Calculate sha1 (Note that sha1 is unsafe nowadays!) */
	public static sha1(buffer: Buffer | string): Buffer {
		return createHash("sha1").update(buffer).digest();
	}

	/** Calculate sha256 (Note that sha256 is vulnerable to length extension attacks, use hash256 instead.) */
	public static sha256(buffer: Buffer | string): Buffer {
		return createHash("sha256").update(buffer).digest();
	}

	/** Calculate sha512 (Note that sha512 is vulnerable to length extension attacks.) */
	public static sha512(buffer: Buffer | string): Buffer {
		return createHash("sha512").update(buffer).digest();
	}

	/** Calculate md5 (Note that md5 is unsafe nowadays!) */
	public static md5(buffer: Buffer | string): Buffer {
		return createHash("md5").update(buffer).digest();
	}

	/**
	 * Check if a string is valid hex code.
	 * @param text The text to test.
	 */
	public static isHex(text: string): boolean {
		return text.search(/^[0-9A-Fa-f]*$/) === 0 && text.length % 2 === 0;
	}

	/** Turn a hex encoded string into binary data. */
	public static hexToBinary(hex: string): Buffer {
		return Buffer.from(hex, "hex");
	}

	/** Turn binary data into a hex encoded string. */
	public static binaryToHex(binary: Buffer): string {
		return binary.toString("hex");
	}

	/**
	 * Check if a string is valid base58 code.
	 * @param text The text to test.
	 */
	public static isBase58(text: string): boolean {
		return text.search(/^[1-9A-HJ-NP-Za-km-z]*$/) === 0;
	}

	/**
	 * Turn a base58 encoded string into binary data.
	 * @throws if one of the characters is not base58
	 */
	public static base58ToBinary(base58: string): Buffer {
		if (base58.length === 0) {
			return Buffer.alloc(0);
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

		// deal with leading zeros
		for (let i = 0; base58[i] === Crypto.base58chars[0] && i < base58.length - 1; i++) {
			bytes.push(0);
		}

		return Buffer.from(bytes.reverse());
	}

	/** Turn binary data into a base58 encoded string. */
	public static binaryToBase58(binary: Buffer): string {
		if (binary.length === 0) {
			return "";
		}
		let result = "";
		const digits = [0];
		// tslint:disable-next-line:prefer-for-of Old versions don't work well with buffer it seems.
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

		//Deal with leading zeros
		for (let i = 0; binary[i] === 0 && i < binary.length - 1; i++) {
			result += Crypto.base58chars[0];
		}
		//Turn digits into characters
		for (let i = digits.length - 1; i >= 0; i--) {
			result += Crypto.base58chars[digits[i]];
		}

		return result;
	}

	/**
	 * Check if a string is valid base64 code.
	 * @param text The text to test.
	 */
	public static isBase64(text: string): boolean {
		return text.search(/^[\+\/-9A-Za-z]*={0,2}$/) === 0 && text.length % 4 === 0;
	}

	/** Turn a base64 encoded string into binary data. */
	public static base64ToBinary(base64: string): Buffer {
		return Buffer.from(base64, "base64");
	}

	/** Turn binary data into a base64 encoded string. */
	public static binaryToBase64(binary: Buffer): string {
		return binary.toString("base64");
	}

	/**
	 * Check if a string is valid utf8 as far as postgres is concerned.
	 * @param text The text to test.
	 */
	public static isUtf8Postgres(text: string): boolean {
		return text.indexOf("\0") === -1;
	}

	/**
	 * Check if a string is valid base64 url code.
	 * @param text The text to test.
	 */
	public static isBase64Url(text: string): boolean {
		return text.search(/^[\-_0-9A-Za-z]*$/) === 0 && text.length % 4 !== 1;
	}

	/** Turn a base64 url encoded string into binary data. */
	public static base64UrlToBinary(base64url: string): Buffer {
		const pad = base64url.length % 4;
		if (pad === 3) {
			base64url = base64url + "=";
		} else if (pad === 2) {
			base64url = base64url + "==";
		}
		return Buffer.from(base64url.replace(/-/g, "+").replace(/_/g, "/"), "base64");
	}

	/** Turn a base64 encoded string into a base64 url encoded string. */
	public static binaryToBase64Url(binary: Buffer): string {
		return binary.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
	}

	/**
	 * Turn a text into for postgres valid utf8 text by removing invalid characters.
	 * @param text The text to transform.
	 */
	public static makeUtf8Postgres(text: string): string {
		return text.replace(/\0/g, "");
	}

	/** Turn an utf8 string into binary data. */
	public static utf8ToBinary(text: string): Buffer {
		return Buffer.from(text, "utf8");
	}

	/** Turn binary data into an utf8 string. */
	public static binaryToUtf8(binary: Buffer): string {
		return binary.toString("utf8");
	}

	/**
	 * Turn a javascript number into binary data.
	 * @throws if unsingedInt is not in the range 0-255
	 */
	public static uInt8ToBinary(unsignedInt: number): Buffer {
		const buffer = Buffer.alloc(1);
		buffer.writeUInt8(unsignedInt, 0);
		return buffer;
	}

	/**
	 * Turn 1 byte of binary data into a javascript number.
	 * @throws if the buffer is <1 byte
	 */
	public static binaryToUInt8(buffer: Buffer): number {
		return buffer.readUInt8(0);
	}

	/**
	 * Turn a javascript number into binary data.
	 * @throws if unsingedInt is not in the range 0-(2^16-1)
	 */
	public static uInt16ToBinary(unsignedInt: number): Buffer {
		const buffer = Buffer.alloc(2);
		buffer.writeUInt16LE(unsignedInt, 0);
		return buffer;
	}

	/**
	 * Turn 2 bytes of binary data into a javascript number.
	 * @throws if the buffer is <2 bytes
	 */
	public static binaryToUInt16(buffer: Buffer): number {
		return buffer.readUInt16LE(0);
	}

	/**
	 * Turn a javascript number into binary data.
	 * @throws if unsingedInt is not in the range 0-(2^32-1)
	 */
	public static uInt32ToBinary(unsignedInt: number): Buffer {
		const buffer = Buffer.alloc(4);
		buffer.writeUInt32LE(unsignedInt, 0);
		return buffer;
	}

	/**
	 * Turn 4 bytes of binary data into a javascript number.
	 * @throws if the buffer is <4 bytes
	 */
	public static binaryToUInt32(buffer: Buffer): number {
		return buffer.readUInt32LE(0);
	}

	/**
	 * Turn a javascript number into binary data.
	 * @throws if unsingedInt is not in the range 0-(2^53-1)
	 */
	public static uLongToBinary(ulong: number): Buffer {
		//A normal long is 64 bits, not 53, but javascript only allows 53 bits accuracy.
		if (!Number.isSafeInteger(ulong) || ulong < 0) {
			throw new Error("Invalid number.");
		}
		const buffer = Buffer.allocUnsafe(8);
		buffer.writeUInt32LE(ulong % 4294967296, 0);
		buffer.writeUInt32LE(ulong / 4294967296, 4);
		return buffer;
	}

	/**
	 * Turn binary data into a javascript number.
	 * @throws if the buffer is <8 bytes or the resulting number is not in the range 0-(2^53-1)
	 */
	public static binaryToULong(binary: Buffer): number {
		const result = binary.readUInt32LE(0) + binary.readUInt32LE(4) * 4294967296;
		if (!Number.isSafeInteger(result)) {
			throw new Error("Invalid binary data.");
		}
		return result;
	}

	/** Generate a random 16 bytes of data. */
	public static id(): Buffer {
		try {
			//It will throw an error if no good random source can be found.
			return randomBytes(16);
		} catch {
			//Use a less random source, which is good enough as security doesn't depend on it.
			//We use use a better random to ensure there are no collisions.
			let result: string = "";
			for (let i = 0; i < 32; i++) {
				result += (Math.random() * 16 | 0).toString(16);
			}
			return Crypto.hexToBinary(result);
		}
	}

	/**
	 * Generate secure random data.
	 * @throws if there is no proper source of random available.
	 */
	public static secureRandom(size: number): Buffer {
		return randomBytes(size);
	}
}