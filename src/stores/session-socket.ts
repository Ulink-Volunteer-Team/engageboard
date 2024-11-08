import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios';
import * as PostAPI from '@/utils/my-post-api';
import { decryptRsa, generateRsaKeyPair } from '@/utils/my-crypto';

export const useSessionSocket = defineStore('session-socket', () => {
	const sessionID = ref("")
	const sessionKey = ref("");
	const serverAPIVersion = ref("");
	const encryptionInitialised = ref(false);
	const axiosInstance = axios.create();

	const setBaseURL = (url: string) => axiosInstance.defaults.baseURL = url;

	const post = <T = unknown>(route: string, data: unknown) => PostAPI.post<T>(route, data, axiosInstance);
	const postAES = <T = unknown>(route: string, data: unknown) => PostAPI.postAES<T>(route, data, sessionID.value, sessionKey.value, axiosInstance);

	function handShake() {
		return new Promise<void>(async (resolve, reject) => {
			const { publicKey, privateKey } = await generateRsaKeyPair()

			axiosInstance.post("/handshake", { userPublicKey: btoa(publicKey) }, {
				headers: { 'Content-Type': 'application/json' },
				timeout: 10000, // 10 second timeout
			})
				.then(async (response) => {
					if (response.data.success) {
						serverAPIVersion.value = response.data.api_version;
						const {id, key} = JSON.parse(await decryptRsa(response.data.data, privateKey));
						sessionID.value = id;
						sessionKey.value = key;
						encryptionInitialised.value = true;
						resolve();
					}
					else {
						reject("Handshake failed: " + response.data.msg)
					}
				})
				.catch((error)  => {
					reject("Fail to handshake: " + String(error));
				});
		});
	}

	return {
		sessionID,
		sessionKey,
		serverAPIVersion,
		encryptionInitialised,
		axiosInstance,
		setBaseURL,
		post,
		postAES,
		handShake
	}
})
