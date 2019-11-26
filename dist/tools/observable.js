"use strict";
/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("./log");
var VObservable = (function () {
    function VObservable() {
        this.observers = [];
        this.callbacks = [];
        this.changed = false;
        if (!VObservable.deprecatedWarning) {
            VObservable.deprecatedWarning = true;
            log_1.Log.warn("VObservable is deprecated and will be removed in future version.", new Error("Deprecated"));
        }
    }
    VObservable.prototype.addObserver = function (o) {
        if (typeof o === "function") {
            this.callbacks.push(o);
        }
        else if (this.observers.indexOf(o) === -1) {
            this.observers.push(o);
        }
    };
    VObservable.prototype.hasObserver = function (o) {
        return this.observers.indexOf(o) !== -1;
    };
    VObservable.prototype.clearChanged = function () {
        this.changed = false;
    };
    VObservable.prototype.countObservers = function () {
        return this.observers.length;
    };
    VObservable.prototype.countCallbacks = function () {
        return this.callbacks.length;
    };
    VObservable.prototype.deleteObserver = function (o) {
        var index = this.observers.indexOf(o);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    };
    VObservable.prototype.hasChanged = function () {
        return this.changed;
    };
    VObservable.prototype.notifyObservers = function (arg) {
        var e_1, _a, e_2, _b;
        if (this.hasChanged()) {
            var toNotify = this.observers.slice();
            try {
                for (var toNotify_1 = __values(toNotify), toNotify_1_1 = toNotify_1.next(); !toNotify_1_1.done; toNotify_1_1 = toNotify_1.next()) {
                    var observer = toNotify_1_1.value;
                    observer.update(this, arg);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (toNotify_1_1 && !toNotify_1_1.done && (_a = toNotify_1.return)) _a.call(toNotify_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            try {
                for (var _c = __values(this.callbacks), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var callback = _d.value;
                    callback(arg);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                }
                finally { if (e_2) throw e_2.error; }
            }
            this.clearChanged();
        }
    };
    VObservable.prototype.setChanged = function () {
        this.changed = true;
    };
    VObservable.deprecatedWarning = false;
    return VObservable;
}());
exports.VObservable = VObservable;
