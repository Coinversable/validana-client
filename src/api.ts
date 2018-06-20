/**
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */

//Note that those types only exist if the example methods have been implemented.
export interface RequestMessage {
	type: "process" | "contracts" | "transaction" | "txStatus"| string;
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
	base64tx: string; //The actual transaction (in base64 format)
	createTs?: number; //Optional info about when it was created
}

export interface TxRequest {
	txId: string; //transactionId (hex)
	push?: boolean; //If the transaction does not exist, do you want to receive a push message once it does? (websocket only)
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
	type: string; //Field Type
	description: string; //Field suggested description
	name: string; //Field suggested name
}

export interface TxResponseOrPush {
	//Transaction info
	id: string;
	contractHash: string;
	payload: string;
	publicKey: string;
	signature: string;
	status: string;
	createTs?: number | null;
	//Processed transaction info (if valid)
	sender: string | null;
	contractType: string | null;
	message: string | null;
	blockId: number | null;
	positionInBlock: number | null;
	processedTs: number | null;
	//Optional info once processed
	receiver: string | null;
	extra1: string | null;
	extra2: string | null;
}