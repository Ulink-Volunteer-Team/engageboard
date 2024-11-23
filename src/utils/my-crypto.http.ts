import CryptoJS from 'crypto-js';
import * as forge from 'node-forge';

/**
 * Generates a random AES-256 password, which includes a 256-bit key and a 128-bit initialization vector (IV).
 *
 * @returns A string consisting of the hexadecimal representation (`<Key><IV>`).
 */
export function generateAes256Password(): string {
	const key = CryptoJS.lib.WordArray.random(32); // 256-bit key
	const iv = CryptoJS.lib.WordArray.random(16);  // 128-bit IV

	const keyHex = key.toString(CryptoJS.enc.Hex);
	const ivHex = iv.toString(CryptoJS.enc.Hex);

	return keyHex + ivHex;
}

/**
 * Decodes an AES-256 password, which is a string consisting of a 256-bit key and a 128-bit initialization vector (IV) in hexadecimal representation.
 *
 * @param password The password to decode.
 * @returns An object containing the key and IV as WordArrays.
 */
export function decodeAes256Password(password: string) {
	const keyHex = password.slice(0, 64);
	const ivHex = password.slice(64);

	return {
		key: CryptoJS.enc.Hex.parse(keyHex),
		iv: CryptoJS.enc.Hex.parse(ivHex),
	};
}

/**
 * Encrypts a string using AES-256 in CBC mode.
 *
 * @param data The data to encrypt.
 * @param password A string consisting of a 256-bit key and a 128-bit initialization vector (IV) in hexadecimal representation.
 * @returns The encrypted data as a base64 encoded string.
 */
export function encryptAes256(data: string, password: string): string {
	const { key, iv } = decodeAes256Password(password);

	const encrypted = CryptoJS.AES.encrypt(data, key, { iv }).ciphertext;
	return encrypted.toString(CryptoJS.enc.Base64);
}

/**
 * Decrypts a base64 encoded string using AES-256 in CBC mode.
 *
 * @param encrypted The encrypted data as a base64 encoded string.
 * @param password A string consisting of a 256-bit key and a 128-bit initialization vector (IV) in hexadecimal representation.
 * @returns The decrypted data as a UTF-8 string.
 */
export function decryptAes256(encrypted: string, password: string): string {
	const { key, iv } = decodeAes256Password(password);

	const decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv });
	return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * Encrypts a string using RSA with OAEP padding and SHA-256 hash.
 *
 * @param data The data to encrypt as a UTF-8 string.
 * @param publicKey The public key in PEM format.
 * @returns The encrypted data as a base64 encoded string.
 */
export async function encryptRsa(data: string, publicKey: string): Promise<string> {
	const rsa = forge.pki.publicKeyFromPem(publicKey);
	const encrypted = rsa.encrypt(data, 'RSA-OAEP', { md: forge.md.sha256.create() });
	return forge.util.encode64(encrypted);
}

/**
 * Decrypts a base64 encoded string using RSA with OAEP padding and SHA-256 hash.
 *
 * @param encrypted The encrypted data as a base64 encoded string.
 * @param privateKey The private key in PEM format.
 * @returns The decrypted data as a UTF-8 string.
 */
export async function decryptRsa(encrypted: string, privateKey: string): Promise<string> {
	const rsa = forge.pki.privateKeyFromPem(privateKey);
	const decoded = forge.util.decode64(encrypted);
	const decrypted = rsa.decrypt(decoded, 'RSA-OAEP', { md: forge.md.sha256.create() });
	return decrypted;
}

/**
 * Generates a public-private key pair using RSA with a modulus length of 2048.
 *
 * @returns An object containing the public and private keys, each as a PEM encoded string (based 64 encoded).
 */
export async function generateRsaKeyPair(): Promise<{ publicKey: string, privateKey: string }> {
	const rsa = forge.pki.rsa;
	const keyPair = rsa.generateKeyPair(2048);
	const publicKey = forge.pki.publicKeyToPem(keyPair.publicKey);
	const privateKey = forge.pki.privateKeyToPem(keyPair.privateKey);

	return {
		publicKey,
		privateKey,
	};
}
