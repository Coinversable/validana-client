"use strict";
/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringMap = void 0;
class StringMap {
    constructor() {
        this.map = {};
    }
    setFromObject(object, overwrite = true) {
        for (const key of Object.keys(object)) {
            if (overwrite || !this.has(key)) {
                this.map[key] = object[key];
            }
        }
        return this;
    }
    setFromMap(map, overwrite = true) {
        for (const key of map.keys()) {
            if (overwrite || !this.has(key)) {
                this.map[key] = map.get(key);
            }
        }
        return this;
    }
    get(key) {
        return this.map[key];
    }
    set(key, value) {
        this.map[key] = value;
        return this;
    }
    has(key) {
        return this.map.hasOwnProperty(key);
    }
    delete(key) {
        delete this.map[key];
        return this;
    }
    keys() {
        return Object.keys(this.map);
    }
    values() {
        const result = [];
        for (const key of Object.keys(this.map)) {
            result.push(this.map[key]);
        }
        return result;
    }
    size() {
        return Object.keys(this.map).length;
    }
    clear() {
        for (const key of Object.keys(this.map)) {
            delete this.map[key];
        }
        return this;
    }
    entries() {
        return Object.assign({}, this.map);
    }
}
exports.StringMap = StringMap;
