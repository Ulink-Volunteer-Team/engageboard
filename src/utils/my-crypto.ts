/**
 * Generates a random AES-256 password, which includes a 256-bit key and a 128-bit initialization vector (IV).
 *
 * @returns A string consisting of the hexadecimal representation (`<Key><IV>`).
 */
export async function generateAes256Password(): Promise<string> {
	const key = await window.crypto.subtle.generateKey(
		{ name: 'AES-CBC', length: 256 },
		true,
		['encrypt', 'decrypt']
	);
	const iv = window.crypto.getRandomValues(new Uint8Array(16));

	// Export the key to a hex string
	const keyBuffer = await window.crypto.subtle.exportKey('raw', key);
	const keyHex = bufferToHex(keyBuffer);

	const ivHex = bufferToHex(iv);

	return keyHex + ivHex;
}

/**
 * Decodes an AES-256 password, which is a string consisting of a 256-bit key and a 128-bit initialization vector (IV) in hexadecimal representation.
 *
 * @param password The password to decode.
 * @returns An object containing the key and IV as Uint8Arrays.
 */
export function decodeAes256Password(password: string) {
	const keyHex = password.slice(0, 64);
	const ivHex = password.slice(64);
	return {
		key: hexToBuffer(keyHex),
		iv: hexToBuffer(ivHex)
	};
}

/**
 * Encrypts a string using AES-256 in CBC mode.
 *
 * @param data The data to encrypt.
 * @param password A string consisting of a 256-bit key and a 128-bit initialization vector (IV) in hexadecimal representation.
 * @returns The encrypted data as a base64 encoded string.
 */
export async function encryptAes256(data: string, password: string): Promise<string> {
	const { key, iv } = decodeAes256Password(password);

	const encoder = new TextEncoder();
	const dataBuffer = encoder.encode(data);

	const encryptedBuffer = await window.crypto.subtle.encrypt(
		{ name: 'AES-CBC', iv },
		await window.crypto.subtle.importKey("raw", key, 'AES-CBC', true, ['encrypt', 'decrypt']),
		dataBuffer
	);

	return bufferToBase64(encryptedBuffer);
}

/**
 * Decrypts a base64 encoded string using AES-256 in CBC mode.
 *
 * @param encrypted The encrypted data as a base64 encoded string.
 * @param password A string consisting of a 256-bit key and a 128-bit initialization vector (IV) in hexadecimal representation.
 * @returns The decrypted data as a UTF-8 string.
 */
export async function decryptAes256(encrypted: string, password: string): Promise<string> {
	const { key, iv } = decodeAes256Password(password);

	const encryptedBuffer = base64ToBuffer(encrypted);

	const decryptedBuffer = await window.crypto.subtle.decrypt(
		{ name: 'AES-CBC', iv },
		await window.crypto.subtle.importKey("raw", key, 'AES-CBC', true, ['encrypt', 'decrypt']),
		encryptedBuffer
	);

	const decoder = new TextDecoder();
	return decoder.decode(decryptedBuffer);
}

function stripPEM(key: string) {
	const header = /^-+BEGIN (RSA|EC|DSA|PRIVATE|PUBLIC) KEY-+\n?/;
	const footer = /\n?-+END (RSA|EC|DSA|PRIVATE|PUBLIC)? KEY-+$/;

	return key.replace(header, '').replace(footer, '').trim();
}

/**
 * Encrypts a string using RSA with OAEP padding and SHA-256 hash.
 *
 * @param data The data to encrypt as a UTF-8 string.
 * @param publicKey The public key in PEM format.
 * @returns The encrypted data as a base64 encoded string.
 */
export async function encryptRsa(data: string, publicKey: string): Promise<string> {
	const publicKeyBuffer = base64ToBuffer(stripPEM(publicKey));
	const cryptoKey = await window.crypto.subtle.importKey(
		'spki',
		publicKeyBuffer,
		{ name: 'RSA-OAEP', hash: 'SHA-256' },
		false,
		['encrypt']
	);

	const encoder = new TextEncoder();
	const dataBuffer = encoder.encode(data);

	const encryptedBuffer = await window.crypto.subtle.encrypt(
		{ name: 'RSA-OAEP' },
		cryptoKey,
		dataBuffer
	);

	return bufferToBase64(encryptedBuffer);
}

/**
 * Decrypts a base64 encoded string using RSA with OAEP padding and SHA-256 hash.
 *
 * @param encrypted The encrypted data as a base64 encoded string.
 * @param privateKey The private key in PEM format.
 * @returns The decrypted data as a UTF-8 string.
 */
export async function decryptRsa(encrypted: string, privateKey: string): Promise<string> {
	const privateKeyBuffer = base64ToBuffer(stripPEM(privateKey));
	const cryptoKey = await window.crypto.subtle.importKey(
		'pkcs8',
		privateKeyBuffer,
		{ name: 'RSA-OAEP', hash: 'SHA-256' },
		false,
		['decrypt']
	);

	const encryptedBuffer = base64ToBuffer(encrypted);

	const decryptedBuffer = await window.crypto.subtle.decrypt(
		{ name: 'RSA-OAEP' },
		cryptoKey,
		encryptedBuffer
	);

	const decoder = new TextDecoder();
	return decoder.decode(decryptedBuffer);
}

/**
 * Generates a public-private key pair using RSA with a modulus length of 2048.
 *
 * @returns An object containing the public and private keys, each as a PEM encoded string (based 64 encoded).
 */
export async function generateRsaKeyPair(): Promise<{ publicKey: string, privateKey: string }> {
	const keyPair = await window.crypto.subtle.generateKey(
		{ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([0x01, 0x00, 0x01]), hash: 'SHA-256' },
		true,
		['encrypt', 'decrypt']
	);

	return {
		privateKey: await pemEncodedPrivateKey(keyPair),
		publicKey: await pemEncodedPublicKey(keyPair)
	};
}

type KeyPairType = {
	publicKey: CryptoKey;
	privateKey: CryptoKey;
}

function pemEncode(label: string, data: ArrayBuffer) {
	const base64encoded = bufferToBase64(data);
	const base64encodedWrapped = base64encoded.replace(/(.{64})/g, "$1\n");
	return `-----BEGIN ${label}-----\n${base64encodedWrapped}\n-----END ${label}-----`;
}

async function pemEncodedPrivateKey(keyPair: KeyPairType) {
	const exported = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
	return pemEncode("PRIVATE KEY", exported);
}

async function pemEncodedPublicKey(keyPair: KeyPairType) {
	const exported = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
	return pemEncode("PUBLIC KEY", exported);
}

function bufferToHex(buffer: ArrayBuffer): string {
	return Array.from(new Uint8Array(buffer))
		.map(byte => byte.toString(16).padStart(2, '0'))
		.join('');
}

function hexToBuffer(hex: string): Uint8Array {
	const length = hex.length / 2;
	const buffer = new Uint8Array(length);
	for (let i = 0; i < length; i++) {
		buffer[i] = parseInt(hex.slice(i * 2, 2), 16);
	}
	return buffer;
}

function bufferToBase64(buffer: ArrayBuffer): string {
	return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64: string): ArrayBuffer {
	const binaryString = atob(base64);
	const buffer = new ArrayBuffer(binaryString.length);
	const view = new Uint8Array(buffer);
	for (let i = 0; i < binaryString.length; i++) {
		view[i] = binaryString.charCodeAt(i);
	}
	return buffer;
}
