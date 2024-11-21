import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios';
import * as PostAPI from '@/utils/my-post-api';
import { decryptRsa, generateRsaKeyPair } from '@/utils/my-crypto';
import { useServerInfo } from "@/stores/server-info";

export type PostPayloadType = {
	[key: string]: unknown
}

export const useSessionSocket = async () => {
	const serverInfo = await useServerInfo();
	return defineStore('session-socket', () => {
		const sessionID = ref("")
		const sessionKey = ref("");
		const serverAPIVersion = ref("");
		const encryptionInitialised = ref(false);
		const axiosInstance = axios.create({
			baseURL: serverInfo.hostURL,
			validateStatus: function (status) {
				// Resolve only if the status is in the range of 200-499
				return status >= 200 && status < 500;
			}
		});

		watch(serverInfo, (newValue, oldValue) => {
			if (newValue.hostURL !== oldValue.hostURL) axiosInstance.defaults.baseURL = newValue.hostURL;
		}, { deep: true })

		const post = <T = unknown>(route: string, data: PostPayloadType) => {
			return PostAPI.post<T>(route, { id: sessionID.value, ...data }, axiosInstance)
		};
		const postAES = <T = unknown>(route: string, data: unknown) => {
			return PostAPI.postAES<T>(route, data, sessionID.value, sessionKey.value, axiosInstance);
		}

		function handShake() {
			return new Promise<void>(async (resolve, reject) => {
				const { publicKey, privateKey } = await generateRsaKeyPair();
				const secure = PostAPI.usingSecureConnection;

				axiosInstance.post("/handshake", { ...(secure ? {} : { userPublicKey: btoa(publicKey) }) }, {
					headers: { 'Content-Type': 'application/json' },
					timeout: 5000,
				})
					.then(async (response) => {
						if (response.data.success) {
							serverAPIVersion.value = response.data.api_version;
							({ id: sessionID.value, key: sessionKey.value } = secure ? response.data.data : JSON.parse(await decryptRsa(response.data.data, privateKey)));
							encryptionInitialised.value = true;
							resolve();
						}
						else {
							reject("Handshake failed: " + response.data.msg)
						}
					})
					.catch((error) => {
						reject("Fail to handshake: " + String(error) + (error.response?.data?.msg ? ". Reason: " + JSON.stringify(error.response.data.msg) : ""));
					});
			});
		}

		return {
			sessionID,
			sessionKey,
			serverAPIVersion,
			encryptionInitialised,
			axiosInstance,
			post,
			postAES,
			handShake
		}
	})();
}
