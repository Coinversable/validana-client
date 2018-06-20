/**
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
export interface RequestMessage {
    type: "process" | "contracts" | "transaction" | "txStatus" | string;
    id?: string;
    data?: any;
}
export interface ResponseOrPushMessage {
    error?: string;
    data?: object;
    id?: string;
    pushType?: string;
}
export interface ProcessRequest {
    base64tx: string;
    createTs?: number;
}
export interface TxRequest {
    txId: string;
    push?: boolean;
}
export interface Contract {
    type: string;
    hash: string;
    version: string;
    description: string;
    template: {
        [fieldType: string]: FieldType;
    };
}
export interface FieldType {
    type: string;
    description: string;
    name: string;
}
export interface TxResponseOrPush {
    id: string;
    contractHash: string;
    payload: string;
    publicKey: string;
    signature: string;
    status: string;
    createTs?: number | null;
    sender: string | null;
    contractType: string | null;
    message: string | null;
    blockId: number | null;
    positionInBlock: number | null;
    processedTs: number | null;
    receiver: string | null;
    extra1: string | null;
    extra2: string | null;
}
