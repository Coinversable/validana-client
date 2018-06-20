/**
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */

import { VObservable } from "./observable";

/**
 * Classical Observer interface.
 * Generics are used to make it clear what data can be received from the update method.
 */
export interface VObserver<T> {

	/**
	 * This method is called when the observed object is changed
	 * @param o The observable object that was changed
	 * @param arg Optional additional arguments passed with change
	 */
	update(o: VObservable<T>, arg?: T): void;
}