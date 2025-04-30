export enum eCacheKeys {
	JORNADAS = "jornadas",
}

export interface ICacheOptions {
	userId?: string;
	expirationMinutes?: number;
	expirationDays?: number;
}

export type LocalCacheType<T> = {
	value: T;
	isExpired: boolean;
	expiration: number;
};

/**
 * The `LocalSettings` class provides methods for managing browser's local storage.
 */
export class LocalCache {
	/**
	 * Sets a value in local storage with optional expiration and user ID.
	 *
	 * @param {eCacheKeys} key - The key to set in local storage.
	 * @param {any} value - The value to set in local storage.
	 * @param {ICacheOptions} [options] - Optional expiration and user ID options.
	 * @param {number} [options.expirationMinutes] - The number of minutes until the value expires.
	 * @param {number} [options.expirationDays] - The number of days until the value expires.
	 * @param {string} [options.userId] - The ID of the user associated with the value.
	 *
	 * @example
	 * // Not set expiration time
	 * LocalSettings.write(eSetKeys.PHOTOS, ['img1.jpeg', 'img2.jpeg']);
	 *
	 * // Store a value with a key and expiration time
	 * LocalSettings.write(eSetKeys.SHOW_ADS, true, { expirationMinutes: 30 });
	 */
	static set(key: eCacheKeys, value: unknown, options?: ICacheOptions): void {
		const expirationMillis = (options?.expirationMinutes || 0) * 60000 + (options?.expirationDays || 0) * 24 * 60 * 60000;
		const userId = options?.userId ?? "";

		const item: LocalCacheType<typeof value> = {
			value: value,
			isExpired: false,
			expiration: expirationMillis > 0 ? new Date().getTime() + expirationMillis : 0,
		};
		localStorage.setItem(`${key}:${userId}`, JSON.stringify(item));
	}

	/**
	 * Retrieves a value from local storage based on the provided key and user ID.
	 *
	 * @param {eCacheKeys} key - The key used to retrieve the value from local storage.
	 * @param {string} [userId=''] - The user ID associated with the value. Defaults to an empty string.
	 * @param {boolean} [removeExpired=false] - Whether to remove the expired item from local storage. Defaults to false.
	 * @returns {LocalCacheType<T> | null} The retrieved value, or null if the value does not exist or has expired.
	 *
	 * @example
	 *
	 *  const data = LocalSettings.get<{ value: string }>(eSetKeys.KeyName);
	 *  if (data) {
	 *    console.log(data.value);
	 *  }
	 */
	static get<T>(key: eCacheKeys, userId: string = "", removeExpired: boolean = false): LocalCacheType<T> | null {
		const keyUser = `${key}:${userId}`;
		const itemString = localStorage.getItem(keyUser);
		if (!itemString) return null;

		const item: LocalCacheType<T> = JSON.parse(itemString);
		if (item.expiration > 0 && new Date().getTime() > item.expiration) {
			if (removeExpired) {
				localStorage.removeItem(keyUser);
				return null;
			}

			item.isExpired = true;
		}

		//item.data = item.data as T;
		return item;
	}

	/**
	 * Unsets the specified key from the localStorage.
	 *
	 * @param {eCacheKeys} key - The key to unset.
	 * @param {string} userId - (optional) The userId to prefix the key with.
	 * @return {void}
	 *
	 * @exemple
	 *
	 * LocalSettings.unset(eSetKeys.KeyName)
	 */
	static unset(key: eCacheKeys, userId: string = ""): void {
		localStorage.removeItem(`${key}:${userId}`);
	}

	/**
	 * Clears all items from the localStorage associated with the given user ID.
	 *
	 * @param {string} userId - The user ID to clear the localStorage for. Defaults to an empty string.
	 *
	 * @example
	 *
	 * LocalSettings.clearAll();
	 */
	static clearAll(userId: string = "") {
		Object.keys(eCacheKeys).forEach((el) => {
			localStorage.removeItem(`${el}:${userId}`);
		});
	}
}
