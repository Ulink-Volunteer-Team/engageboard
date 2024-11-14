import {ref, watch} from 'vue'
import {defineStore} from 'pinia'
import localforage from 'localforage';

const storage = localforage.createInstance({
	name: "session-credential",
	storeName: "session-credential",
});

const storedValue = {
	token: await storage.getItem<string>("token"),
	userID: await storage.getItem<string>("userID")
}

export const useSessionCredentialStore = defineStore('session-credential', () => {
	const token = ref(storedValue.token || "");
	const userID = ref(storedValue.userID || "");

	const isLoggedIn = () => token.value !== "";

	watch([token, userID], () => {
		storage.setItem("token", token.value);
		storage.setItem("userID", userID.value);
	}, {deep: true})
	return {token, userID, isLoggedIn}
});

export const clearSessionCredential = async () => {
	await storage.removeItem("token");
	await storage.removeItem("userID");
}
