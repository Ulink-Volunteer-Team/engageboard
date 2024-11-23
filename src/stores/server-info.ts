import { ref } from 'vue';
import { defineStore } from 'pinia';
import localforage from 'localforage';

const storage = localforage.createInstance({
	name: "server-info",
	storeName: "server-info",
});

const initialValue = {
	hostURL: "",
};

export const useServerInfo = async () => {
	const storedValue = await storage.getItem<{ hostURL: string }>("server-info") || initialValue;
	return defineStore('server-info', () => {
		const hostURL = ref(storedValue.hostURL || "");
		return { hostURL };
	})();
};
