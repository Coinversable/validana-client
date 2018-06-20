/**
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */

/**
 * This class saves key-value pairs.
 * Similar to the ES6 Map, but compatile with older browsers.
 */
export class StringMap<T> {
	private map: { [key: string]: T } = {};

	/**
	 * Add all elements from an object, overwriting current values if @param overwrite is true (default).
	 * @param object The array of key-value pairs to add from.
	 * @param overwrite Should intersecting elements be overwritten or not.
	 */
	public setFromObject(this: StringMap<T>, object: Readonly<{ [key: string]: T }>, overwrite: boolean = true): StringMap<T> {
		for (const key of Object.keys(object)) {
			if (overwrite || !this.has(key)) {
				this.map[key] = object[key];
			}
		}
		return this;
	}

	/**
	 * Add all elements from another map, overwriting current values if @param overwrite is true (default).
	 * @param map The map to add from.
	 * @param overwrite Should intersecting elements be overwritten or not.
	 */
	public setFromMap(this: StringMap<T>, map: Readonly<StringMap<T>>, overwrite: boolean = true): StringMap<T> {
		for (const key of map.keys()) {
			if (overwrite || !this.has(key)) {
				this.map[key] = map.get(key);
			}
		}
		return this;
	}

	/**
	 * Get the value associated with a certain key (or undefined if it does not exist).
	 * @param key the key
	 */
	public get(key: string): T { //https://github.com/Microsoft/TypeScript/issues/9619 Add undefined if there is a solution
		return this.map[key];
	}

	/**
	 * Set the value associated with a certain key.
	 * @param key the key
	 * @param value the value
	 */
	public set(this: StringMap<T>, key: string, value: T): StringMap<T> {
		this.map[key] = value;
		return this;
	}

	/**
	 * Check if the Map contains a certain key-value pair.
	 * @param key the key of the key-value pair
	 */
	public has(key: string): boolean {
		return this.map.hasOwnProperty(key);
	}

	/**
	 * Delete a key-value pair.
	 * @param key the key
	 */
	public delete(this: StringMap<T>, key: string): StringMap<T> {
		delete this.map[key];
		return this;
	}

	/** Get a list of all keys in this Map. */
	public keys(): string[] {
		return Object.keys(this.map);
	}

	/** Get a list of all values in this Map. */
	public values(): T[] {
		const result: T[] = [];
		for (const key of Object.keys(this.map)) {
			result.push(this.map[key]);
		}
		return result;
	}

	/** Get the total amount of key-value pairs in this Map. */
	public size(): number {
		return Object.keys(this.map).length;
	}

	/** Remove all values from this Map. */
	public clear(this: StringMap<T>): StringMap<T> {
		for (const key of Object.keys(this.map)) {
			delete this.map[key];
		}
		return this;
	}

	/** Get a list of all key-value pairs in this Map. */
	public entries(): { [key: string]: T } {
		return { ...this.map };
	}
}