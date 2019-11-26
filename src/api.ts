/*!
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
	status: number;
	error?: string;
	data?: object;
	id?: string;
	pushType?: string;
}

export interface ProcessRequest {
	/** The transaction (in base64 format, same as transaction inside a block) */
	base64tx: string;
	/** Optional info about when it was created. */
	createTs?: number;
}

export interface TxRequest {
	/** Transaction id (hex) */
	txId: string;
	/** Return what is available. Send the rest as a push message when they are? (websocket only) */
	push?: boolean;
	/** Do not return till everything is available? If true 'push' will be ignored. */
	wait?: boolean;
}

export interface Contract {
	type: string;
	hash: string;
	version: string;
	description: string;
	template: {
		[fieldType: string]: FieldType;
	};
	validanaVersion: number;
}

export interface FieldType {
	type: string; //Field Type
	desc: string; //Field suggested description
	name: string; //Field suggested name
}

export interface TxResponseOrPush {
	//Transaction info
	id: string;
	contractHash: string;
	payload: any;
	publicKey: string;
	signature: string;
	status: "new" | "invalid" | "accepted" | "rejected";
	createTs?: number | null;
	//Processed transaction info (if accepted and possibly if rejected)
	sender: string | null;
	contractType: string | null;
	message: string | null;
	blockId: number | null;
	positionInBlock: number | null;
	processedTs: number | null;
	//Optional info once processed
	receiver: string | null;
}