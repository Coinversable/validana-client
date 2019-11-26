/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
import { VObserver } from "./observer";
/**
 * Classical Observable class
 * Generics are used to make it clear what data can be forwarded to observers.
 * @deprecated Use an event emitter.
 */
export declare class VObservable<T> {
    private static deprecatedWarning;
    private observers;
    private callbacks;
    private changed;
    constructor();
    /**
     * Add observer to the list of observers.
     * @param o The observer to add
     */
    addObserver(o: VObserver<T> | ((arg?: T) => void)): void;
    /**
     * Check if this has a certain observer.
     * @param o the observer to check
     */
    hasObserver(o: VObserver<T>): boolean;
    /** Indicates that the object is no longer changed */
    protected clearChanged(): void;
    /** Return the number of active observers */
    countObservers(): number;
    countCallbacks(): number;
    /**
     * Delete given observer
     * @param o The observer to delete
     */
    deleteObserver(o: VObserver<T>): void;
    /**
     * See if this element has changed
     */
    hasChanged(): boolean;
    /**
     * Notify all listening observers when something has changed
     * @param arg (optional) additional argument to pass on
     */
    notifyObservers(arg?: T): void;
    /**
     * Object contents have changed
     * It is now possible to notify observers
     */
    protected setChanged(): void;
}
