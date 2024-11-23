import { fileURLToPath, URL } from 'node:url';
import dotenv from 'dotenv';

import { defineConfig } from 'vite';

import { createHtmlPlugin as html } from 'vite-plugin-html';
import vue from '@vitejs/plugin-vue';

dotenv.config();

const debugHost = "http://localhost:3000";
const releaseHost = process.env.SERVER_HOST;

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const isDev = mode === 'development';
	const host = JSON.stringify((isDev ? debugHost : releaseHost) || "https://example.com");
	console.log(`Using server host: ${host}`);

	const cryptoEntry = process.env.HTTP_COMPATIBLE === 'true'
		? 'src/utils/my-crypto.http.ts'
		: 'src/utils/my-crypto.https.ts';

	return {
		mode,
		define: {
			__HOST_URL__: host,
		},
		plugins: [
			vue(),
			html({
				minify: true,
			}),
		],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url)),
				'my-crypto': cryptoEntry,
			},
		},
		build: {
			...(isDev
				? { // Options for development builds
					minify: false,
					sourcemap: true,
				}
				: { // Options for production builds
					minify: true,
					sourcemap: false,
				}),
		},
	};
});
