/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
/// <reference types="node" />
import * as ecurve from "ecurve";
import { Buffer } from "buffer";
/** A public key. We use and accept compressed keys only. */
export declare class PublicKey {
    protected static readonly secp256k1: ecurve.Curve;
    /** The public key and address in different formats. */
    readonly publicKey: Buffer;
    private address;
    /**
     * Create a new public key from a buffer.
     * @throws if the buffer is not a valid public key.
     */
    constructor(publicKey: Buffer);
    /** Check if a public key is valid or not. We accept only compressed public keys. */
    static isValidPublic(publicKey: Buffer): boolean;
    /** Check if an address is valid or not. Only prefix 0 is accepted. */
    static isValidAddress(address: string | Buffer): boolean;
    /** Get the address of this public key. We use the address of the compressed key with prefix 0. */
    getAddress(): string;
    /**
     * Get the address of this public key as binary data.
     * Unlike string addresses there is no checksum, nor prefix, as users are not expected to use addresses in binary format.
     */
    getAddressAsBuffer(): Buffer;
    /**
     * Convert an address to binary format.
     * @throws If the address is invalid.
     */
    static addressAsBuffer(address: string | Buffer): Buffer;
    /**
     * Convert an address to string format.
     * @throws If the address in invalid.
     */
    static addressAsString(address: string | Buffer): string;
    /**
     * Verify a message and its signature against a public key. Signature should exist of 32 bytes r followed by 32 bytes s.
     * @throws if the data or signature have an invalid format
     */
    verify(data: Buffer, signature: Buffer): boolean;
}
/**
 * A private key.
 * Technical info: Only the secp256k1 curve is supported, We use compressed wif prefix 0x80 (same as bitcoin).
 */
export declare class PrivateKey extends PublicKey {
    /** The private key WITHOUT network or compression info. */
    readonly privateKey: Buffer;
    private constructor();
    /**
     * Generate a new random private key.
     * @throws If no suitable random source is available.
     */
    static generate(): PrivateKey;
    /** Generate a new non-random private key based on data. */
    static generateNonRandom(data: Buffer, salt: Buffer): PrivateKey;
    /** Check if a WIF is valid or not. Only compressed wifs with prefix 0x80 are accepted. */
    static isValidWIF(wif: string): boolean;
    /** Get the wif of this private key. */
    toWIF(): string;
    /**
     * Turn a WIF into a private key.
     * @throws If wif is not a valid private key.
     */
    static fromWIF(wif: string): PrivateKey;
    /** Sign data with this private key. Returns the signature as 32 bytes r followed by 32 bytes s. */
    sign(data: Buffer): Buffer;
}
