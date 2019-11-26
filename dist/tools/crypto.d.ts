/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
/// <reference types="node" />
/** Functions for hashing, and encoding binary data into other formats and back again. */
export declare class Crypto {
    private static readonly base58chars;
    private static readonly base58map;
    /** Calculate hash160 (ripemd160 of sha256) */
    static hash160(buffer: Buffer | string): Buffer;
    /** Calculate hash256 (double sha256) */
    static hash256(buffer: Buffer | string): Buffer;
    /** Calculate ripemd160 */
    static ripemd160(buffer: Buffer | string): Buffer;
    /** Calculate sha1 (Note that sha1 is unsafe nowadays!) */
    static sha1(buffer: Buffer | string): Buffer;
    /** Calculate sha256 (Note that sha256 is vulnerable to length extension attacks, use hash256 instead.) */
    static sha256(buffer: Buffer | string): Buffer;
    /** Calculate sha512 (Note that sha512 is vulnerable to length extension attacks.) */
    static sha512(buffer: Buffer | string): Buffer;
    /** Calculate md5 (Note that md5 is unsafe nowadays!) */
    static md5(buffer: Buffer | string): Buffer;
    /**
     * Check if a string is valid hex code.
     * @param text The text to test.
     */
    static isHex(text: string): boolean;
    /** Turn a hex encoded string into binary data. */
    static hexToBinary(hex: string): Buffer;
    /** Turn binary data into a hex encoded string. */
    static binaryToHex(binary: Buffer): string;
    /**
     * Check if a string is valid base58 code.
     * @param text The text to test.
     */
    static isBase58(text: string): boolean;
    /**
     * Turn a base58 encoded string into binary data.
     * @throws if one of the characters is not base58
     */
    static base58ToBinary(base58: string): Buffer;
    /** Turn binary data into a base58 encoded string. */
    static binaryToBase58(binary: Buffer): string;
    /**
     * Check if a string is valid base64 code.
     * @param text The text to test.
     */
    static isBase64(text: string): boolean;
    /** Turn a base64 encoded string into binary data. */
    static base64ToBinary(base64: string): Buffer;
    /** Turn binary data into a base64 encoded string. */
    static binaryToBase64(binary: Buffer): string;
    /**
     * Check if a string is valid utf8 as far as postgres is concerned.
     * @param text The text to test.
     */
    static isUtf8Postgres(text: string): boolean;
    /**
     * Check if a string is valid base64 url code.
     * @param text The text to test.
     */
    static isBase64Url(text: string): boolean;
    /** Turn a base64 url encoded string into binary data. */
    static base64UrlToBinary(base64url: string): Buffer;
    /** Turn a base64 encoded string into a base64 url encoded string. */
    static binaryToBase64Url(binary: Buffer): string;
    /**
     * Turn a text into for postgres valid utf8 text by removing invalid characters.
     * @param text The text to transform.
     */
    static makeUtf8Postgres(text: string): string;
    /** Turn an utf8 string into binary data. */
    static utf8ToBinary(text: string): Buffer;
    /** Turn binary data into an utf8 string. */
    static binaryToUtf8(binary: Buffer): string;
    /**
     * Turn a javascript number into binary data.
     * @throws if unsingedInt is not in the range 0-255
     */
    static uInt8ToBinary(unsignedInt: number): Buffer;
    /**
     * Turn 1 byte of binary data into a javascript number.
     * @throws if the buffer is <1 byte
     */
    static binaryToUInt8(buffer: Buffer): number;
    /**
     * Turn a javascript number into binary data.
     * @throws if unsingedInt is not in the range 0-(2^16-1)
     */
    static uInt16ToBinary(unsignedInt: number): Buffer;
    /**
     * Turn 2 bytes of binary data into a javascript number.
     * @throws if the buffer is <2 bytes
     */
    static binaryToUInt16(buffer: Buffer): number;
    /**
     * Turn a javascript number into binary data.
     * @throws if unsingedInt is not in the range 0-(2^32-1)
     */
    static uInt32ToBinary(unsignedInt: number): Buffer;
    /**
     * Turn 4 bytes of binary data into a javascript number.
     * @throws if the buffer is <4 bytes
     */
    static binaryToUInt32(buffer: Buffer): number;
    /**
     * Turn a javascript number into binary data.
     * @throws if unsingedInt is not in the range 0-(2^53-1)
     */
    static uLongToBinary(ulong: number): Buffer;
    /**
     * Turn binary data into a javascript number.
     * @throws if the buffer is <8 bytes or the resulting number is not in the range 0-(2^53-1)
     */
    static binaryToULong(binary: Buffer): number;
    /** Generate a random 16 bytes of data. */
    static id(): Buffer;
    /**
     * Generate secure random data.
     * @throws if there is no proper source of random available.
     */
    static secureRandom(size: number): Buffer;
}
