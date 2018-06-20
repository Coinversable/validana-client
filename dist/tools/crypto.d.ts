/**
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
    static hash160(buffer: Buffer): Buffer;
    /** Calculate hash256 (double sha256) */
    static hash256(buffer: Buffer): Buffer;
    /** Calculate ripemd160 */
    static ripemd160(buffer: Buffer): Buffer;
    /** Calculate sha1 (Note that sha1 is unsafe nowadays!)  */
    static sha1(buffer: Buffer): Buffer;
    /** Calculate sha256 (Note that sha256 is vulnerable to length extension attacks, use hash256 instead.) */
    static sha256(buffer: Buffer): Buffer;
    /** Calculate md5 (Note that md5 is unsafe nowadays!)  */
    static md5(buffer: Buffer): Buffer;
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
    /** Turn a base58 encoded string into binary data. */
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
     * Turn a text into for postgres valid utf8 text by removing invalid characters.
     * @param text The text to transform.
     */
    static makeUtf8Postgres(text: string): string;
    /** Turn an utf8 string into binary data. */
    static utf8ToBinary(text: string): Buffer;
    /** Turn binary data into an utf8 string. */
    static binaryToUtf8(binary: Buffer): string;
    /**  Turn a javascript number into binary data (Only valid for numbers 0-255, will throw an error otherwise). */
    static uInt8ToBinary(unsignedInt: number): Buffer;
    /** Turn 1 byte of binary data into a javascript number. Will throw an error if it cannot be converted. */
    static binaryToUInt8(buffer: Buffer): number;
    /** Turn a javascript number into binary data (Only valid for numbers 0-(2^16-1), will throw an error otherwise). */
    static uInt16ToBinary(unsignedInt: number): Buffer;
    /** Turn 2 bytes of binary data into a javascript number. Will throw an error if it cannot be converted. */
    static binaryToUInt16(buffer: Buffer): number;
    /** Turn a javascript number into binary data (Only valid for numbers 0-(2^32-1), will throw an error otherwise). */
    static uInt32ToBinary(unsignedInt: number): Buffer;
    /** Turn 4 bytes of binary data into a javascript number. Will throw an error if it cannot be converted. */
    static binaryToUInt32(buffer: Buffer): number;
    /** Turn a javascript number into binary data (Only valid for numbers 0-(2^53-1), will throw an error otherwise). */
    static uLongToBinary(ulong: number): Buffer;
    /** Turn binary data into a javascript number. Will throw an error if it cannot be converted. */
    static binaryToULong(binary: Buffer): number;
    /** Generate a random 16 bytes of data. */
    static id(): Buffer;
}
