import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const debugHost = "http://localhost:3000";
const releaseHost = process.env.SERVER_HOST;

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const isDev = mode === 'development';
	const host = JSON.stringify((isDev ? debugHost : releaseHost) || "https://example.com");
	console.log(`Using server host: ${host}`);
	return {
		mode,
		define: {
			__HOST_URL__: host
		},
		plugins: [
			vue(),
		],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url))
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
			// Shared settings

		},
	}
})
