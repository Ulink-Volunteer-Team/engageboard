/**
 * Represents the decoded AES-256 password, containing a key and initialization vector (IV).
 */
export interface DecodedAes256Password {
	key: CryptoJS.lib.WordArray | Uint8Array;
	iv: CryptoJS.lib.WordArray | Uint8Array;
}

/**
 * Represents the RSA key pair with PEM encoded public and private keys.
 */
export interface RsaKeyPair {
	publicKey: string;
	privateKey: string;
}

/**
 * Generates a random AES-256 password, which includes a 256-bit key and a 128-bit initialization vector (IV).
 *
 * @returns A string consisting of the hexadecimal representation (`<Key><IV>`).
 */
export declare function generateAes256Password(): string;

/**
 * Decodes an AES-256 password, which is a string consisting of a 256-bit key and a 128-bit initialization vector (IV) in hexadecimal representation.
 *
 * @param password The password to decode.
 * @returns An object containing the key and IV as WordArrays.
 */
export declare function decodeAes256Password(password: string): DecodedAes256Password;

/**
 * Encrypts a string using AES-256 in CBC mode.
 *
 * @param data The data to encrypt.
 * @param password A string consisting of a 256-bit key and a 128-bit initialization vector (IV) in hexadecimal representation.
 * @returns The encrypted data as a base64 encoded string.
 */
export declare function encryptAes256(data: string, password: string): string;

/**
 * Decrypts a base64 encoded string using AES-256 in CBC mode.
 *
 * @param encrypted The encrypted data as a base64 encoded string.
 * @param password A string consisting of a 256-bit key and a 128-bit initialization vector (IV) in hexadecimal representation.
 * @returns The decrypted data as a UTF-8 string.
 */
export declare function decryptAes256(encrypted: string, password: string): string;

/**
 * Encrypts a string using RSA with OAEP padding and SHA-256 hash.
 *
 * @param data The data to encrypt as a UTF-8 string.
 * @param publicKey The public key in PEM format.
 * @returns The encrypted data as a base64 encoded string.
 */
export declare function encryptRsa(data: string, publicKey: string): Promise<string>;

/**
 * Decrypts a base64 encoded string using RSA with OAEP padding and SHA-256 hash.
 *
 * @param encrypted The encrypted data as a base64 encoded string.
 * @param privateKey The private key in PEM format.
 * @returns The decrypted data as a UTF-8 string.
 */
export declare function decryptRsa(encrypted: string, privateKey: string): Promise<string>;

/**
 * Generates a public-private key pair using RSA with a modulus length of 2048.
 *
 * @returns An object containing the public and private keys, each as a PEM encoded string (base64 encoded).
 */
export declare function generateRsaKeyPair(): Promise<RsaKeyPair>;
