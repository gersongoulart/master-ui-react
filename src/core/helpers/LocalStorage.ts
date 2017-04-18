﻿import appSettings from 'core/settings';
import { LocalStorageTypes } from 'core/enums';

export interface IStorage {
	getItem(key: string): any;
	setItem(key: string, value: any): void;
	removeItem(key: string): void;
}

class LocalStorage {

	storage: any;

	constructor() {
		switch (appSettings.localStorageMode) {
			case LocalStorageTypes.Local:
				this.storage = window.localStorage;
				if (!('localStorage' in window && window.localStorage !== null)) {
					console.warn('Warning: Local Storage is disabled or unavailable');
				}
				break;
			case LocalStorageTypes.Session:
				this.storage = window.sessionStorage;
				if (!('sessionStorage' in window && window.sessionStorage !== null)) {
					console.warn('Warning: Session Storage is disabled or unavailable. Will not work correctly.');
				}
			break;
		}
	}

	get(key: string): any {
		return this.storage.getItem(key);
	}

	set(key: string, value: any): any {
		return this.storage.setItem(key, value);
	}

	remove(key: string): any {
		return this.storage.removeItem(key);
	}

}

export default new LocalStorage();
