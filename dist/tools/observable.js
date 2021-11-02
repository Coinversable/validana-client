"use strict";
/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VObservable = void 0;
const log_1 = require("./log");
class VObservable {
    constructor() {
        this.observers = [];
        this.callbacks = [];
        this.changed = false;
        if (!VObservable.deprecatedWarning) {
            VObservable.deprecatedWarning = true;
            log_1.Log.warn("VObservable is deprecated and will be removed in future version.", new Error("Deprecated"));
        }
    }
    addObserver(o) {
        if (typeof o === "function") {
            this.callbacks.push(o);
        }
        else if (this.observers.indexOf(o) === -1) {
            this.observers.push(o);
        }
    }
    hasObserver(o) {
        return this.observers.indexOf(o) !== -1;
    }
    clearChanged() {
        this.changed = false;
    }
    countObservers() {
        return this.observers.length;
    }
    countCallbacks() {
        return this.callbacks.length;
    }
    deleteObserver(o) {
        const index = this.observers.indexOf(o);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }
    hasChanged() {
        return this.changed;
    }
    notifyObservers(arg) {
        if (this.hasChanged()) {
            const toNotify = this.observers.slice();
            for (const observer of toNotify) {
                observer.update(this, arg);
            }
            for (const callback of this.callbacks) {
                callback(arg);
            }
            this.clearChanged();
        }
    }
    setChanged() {
        this.changed = true;
    }
}
exports.VObservable = VObservable;
VObservable.deprecatedWarning = false;
