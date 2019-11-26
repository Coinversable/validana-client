/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
/**
 * @deprecated Use a general polyfill instead.
 * This class saves key-value pairs.
 * Similar to the ES6 Map, but compatible with older browsers.
 */
export declare class StringMap<T> {
    private map;
    /**
     * Add all elements from an object, overwriting current values if @param overwrite is true (default).
     * @deprecated Use a general polyfill instead.
     * @param object The array of key-value pairs to add from.
     * @param overwrite Should intersecting elements be overwritten or not.
     */
    setFromObject(this: StringMap<T>, object: Readonly<{
        [key: string]: T;
    }>, overwrite?: boolean): StringMap<T>;
    /**
     * Add all elements from another map, overwriting current values if @param overwrite is true (default).
     * @deprecated Use a general polyfill instead.
     * @param map The map to add from.
     * @param overwrite Should intersecting elements be overwritten or not.
     */
    setFromMap(this: StringMap<T>, map: Readonly<StringMap<T>>, overwrite?: boolean): StringMap<T>;
    /**
     * Get the value associated with a certain key (or undefined if it does not exist).
     * @deprecated Use a general polyfill instead.
     * @param key the key
     */
    get(key: string): T;
    /**
     * Set the value associated with a certain key.
     * @deprecated Use a general polyfill instead.
     * @param key the key
     * @param value the value
     */
    set(this: StringMap<T>, key: string, value: T): StringMap<T>;
    /**
     * Check if the Map contains a certain key-value pair.
     * @deprecated Use a general polyfill instead.
     * @param key the key of the key-value pair
     */
    has(key: string): boolean;
    /**
     * Delete a key-value pair.
     * @deprecated Use a general polyfill instead.
     * @param key the key
     */
    delete(this: StringMap<T>, key: string): StringMap<T>;
    /**
     * Get a list of all keys in this Map.
     * @deprecated Use a general polyfill instead.
     */
    keys(): string[];
    /**
     * Get a list of all values in this Map.
     * @deprecated Use a general polyfill instead.
     */
    values(): T[];
    /**
     * Get the total amount of key-value pairs in this Map.
     * @deprecated Use a general polyfill instead.
     */
    size(): number;
    /**
     * Remove all values from this Map.
     * @deprecated Use a general polyfill instead.
     */
    clear(this: StringMap<T>): StringMap<T>;
    /**
     * Get a list of all key-value pairs in this Map.
     * @deprecated Use a general polyfill instead.
     */
    entries(): {
        [key: string]: T;
    };
}
