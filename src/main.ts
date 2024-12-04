// This is the entry point of the entire application

import './assets/base.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import { useServerInfo } from "@/stores/server-info";
import { useSessionSocket } from './stores/session-socket';

async function main() {
	const loading = document.getElementById("connecting-box")!;
	loading.style.display = "";

	const errorBox = document.getElementById("error-box")!;
	const errorMessage = document.getElementById("error-message")!;

	try {
		// Create the main app
		const app = createApp(App);
		app.use(createPinia());

		// Get the server host URL from the server info store
		const serverInfo = await useServerInfo();
		serverInfo.hostURL = __HOST_URL__;
		console.log("Server host: " + serverInfo.hostURL);

		// Set the status page URL
		const statusLink = document.getElementById("status-link")! as HTMLAnchorElement;
		const serverDomain = serverInfo.hostURL.split("/")[2].split(":").shift();
		statusLink.href = (serverDomain === "localhost")
			? "about:blank"
			: `https://status.${serverDomain}/`;
		console.log(`Using the status page URL: ${statusLink.href}`);

		// Create the session socket and handshake with the server
		const sessionSocket = await useSessionSocket();
		console.log("Session socket initialised, handshaking");

		await sessionSocket.handShake();
		console.log("Handshake success");

		// If the handshake is successful, use the router and mount the app
		app.use(router);
		loading.remove();
		errorBox.remove();
		app.mount('#app');
	} catch (error) {
		// If the handshake fails, display the error message
		loading.remove();
		errorMessage.innerHTML = String(error);
		errorBox.style.display = "";

		console.error("Fail to initialise Engageboard");
		console.error(error);
	}
}

document.addEventListener('DOMContentLoaded', main);

