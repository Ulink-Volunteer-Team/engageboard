import axios, { type AxiosInstance } from 'axios';
import { encryptAes256, decryptAes256 } from './my-crypto';

export const usingSecureConnection = location.protocol.split(":").shift() === "https" || location.href.split(":")[1].slice(2) === "localhost";

export function post<T = unknown>(route: string, data: unknown, axiosInstance?: AxiosInstance) {
	if (!axiosInstance) axiosInstance = axios.create();
	return new Promise<T>((resolve, reject) => {
		axiosInstance.post(route, data, {
			headers: {
				'Content-Type': 'application/json',
			},
			timeout: 10000, // 10 second timeout
		}).then(async function (response) {
			if (response.data.success) {
				resolve(response.data);
			} else {
				reject("API call failed: " + (response.data.msg || 'unknown error'));
			}
		}).catch(function (error) {
			reject("Fail to post: " + String(error));
		});
	});
}

export function postAES<T = unknown>(route: string, data: unknown, sessionID: string, sessionKey: string, axiosInstance?: AxiosInstance) {
	return new Promise<T>(async (resolve, reject) => {
		console.log(data);
		post<{success: boolean, data: string | T}>(route, { session: sessionID, data: usingSecureConnection ? data : encryptAes256(JSON.stringify(data), sessionKey) }, axiosInstance)
			.then(async (rawData) => {
				try {
					const parsedData = usingSecureConnection ? rawData.data as T : JSON.parse(decryptAes256(rawData.data as string, sessionKey)) as T;
					if(!parsedData) reject("Empty data");
					resolve(parsedData);
				}
				catch (error) {
					reject("Fail to decrypt data: " + String(error));
				}
			}).catch((error) => {
				reject(String(error));
			})
	})
}

