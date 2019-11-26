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
var StringMap = (function () {
    function StringMap() {
        this.map = {};
    }
    StringMap.prototype.setFromObject = function (object, overwrite) {
        var e_1, _a;
        if (overwrite === void 0) { overwrite = true; }
        try {
            for (var _b = __values(Object.keys(object)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                if (overwrite || !this.has(key)) {
                    this.map[key] = object[key];
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return this;
    };
    StringMap.prototype.setFromMap = function (map, overwrite) {
        var e_2, _a;
        if (overwrite === void 0) { overwrite = true; }
        try {
            for (var _b = __values(map.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                if (overwrite || !this.has(key)) {
                    this.map[key] = map.get(key);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return this;
    };
    StringMap.prototype.get = function (key) {
        return this.map[key];
    };
    StringMap.prototype.set = function (key, value) {
        this.map[key] = value;
        return this;
    };
    StringMap.prototype.has = function (key) {
        return this.map.hasOwnProperty(key);
    };
    StringMap.prototype.delete = function (key) {
        delete this.map[key];
        return this;
    };
    StringMap.prototype.keys = function () {
        return Object.keys(this.map);
    };
    StringMap.prototype.values = function () {
        var e_3, _a;
        var result = [];
        try {
            for (var _b = __values(Object.keys(this.map)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                result.push(this.map[key]);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return result;
    };
    StringMap.prototype.size = function () {
        return Object.keys(this.map).length;
    };
    StringMap.prototype.clear = function () {
        var e_4, _a;
        try {
            for (var _b = __values(Object.keys(this.map)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                delete this.map[key];
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return this;
    };
    StringMap.prototype.entries = function () {
        return Object.assign({}, this.map);
    };
    return StringMap;
}());
exports.StringMap = StringMap;
