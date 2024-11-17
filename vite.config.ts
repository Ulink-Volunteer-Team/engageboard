import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const isDev = mode === 'development';
	const serverIP = JSON.stringify(process.env.SERVER_IP || "localhost");
	const serverPort = JSON.stringify(JSON.parse(process.env.SERVER_PORT || "3000"));
	if (isDev) {
		console.log(`Server IP: ${serverIP}`);
		console.log(`Server Port: ${serverPort}`);
	}
	return {
		define: {
			__SERVER_IP__: serverIP,
			__SERVER_PORT__: serverPort,
		},
		plugins: [
			vue(),
		],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url))
			},
		},
		build: isDev
			? {
				minify: false,
				sourcemap: true,
			}
			: {
				minify: true,
				sourcemap: false,
			},
	}
})
