/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */

import { VObserver } from "./observer";
import { Log } from "./log";

/**
 * Classical Observable class
 * Generics are used to make it clear what data can be forwarded to observers.
 * @deprecated Use an event emitter.
 */
export class VObservable<T> {
	private static deprecatedWarning: boolean = false;

	// The observers this observable should notify
	private observers: Array<VObserver<T>> = [];
	private callbacks: Array<(arg?: T) => void> = [];

	// If this object has changed
	private changed: boolean = false;

	public constructor() {
		if (!VObservable.deprecatedWarning) {
			VObservable.deprecatedWarning = true;
			Log.warn("VObservable is deprecated and will be removed in future version.", new Error("Deprecated"));
		}
	}

	/**
	 * Add observer to the list of observers.
	 * @param o The observer to add
	 */
	public addObserver(o: VObserver<T> | ((arg?: T) => void)): void {
		if (typeof o === "function") {
			this.callbacks.push(o);
		} else if (this.observers.indexOf(o) === -1) {
			this.observers.push(o);
		}
	}

	/**
	 * Check if this has a certain observer.
	 * @param o the observer to check
	 */
	public hasObserver(o: VObserver<T>): boolean {
		return this.observers.indexOf(o) !== -1;
	}

	/** Indicates that the object is no longer changed */
	protected clearChanged(): void {
		this.changed = false;
	}

	/** Return the number of active observers */
	public countObservers(): number {
		return this.observers.length;
	}

	public countCallbacks(): number {
		return this.callbacks.length;
	}

	/**
	 * Delete given observer
	 * @param o The observer to delete
	 */
	public deleteObserver(o: VObserver<T>): void {
		const index = this.observers.indexOf(o);
		if (index > -1) {
			this.observers.splice(index, 1);
		}
	}

	/**
	 * See if this element has changed
	 */
	public hasChanged(): boolean {
		return this.changed;
	}

	/**
	 * Notify all listening observers when something has changed
	 * @param arg (optional) additional argument to pass on
	 */
	public notifyObservers(arg?: T): void {

		// Make sure there are changes to notify
		if (this.hasChanged()) {

			// Make a copy to ensure observers that unregister themselfs do not prevent others from being notified
			const toNotify = this.observers.slice();
			for (const observer of toNotify) {
				observer.update(this, arg);
			}
			for (const callback of this.callbacks) {
				callback(arg);
			}

			// Clear changed
			this.clearChanged();
		}
	}

	/**
	 * Object contents have changed
	 * It is now possible to notify observers
	 */
	protected setChanged(): void {
		this.changed = true;
	}
}