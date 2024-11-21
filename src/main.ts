import './assets/base.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import { useServerInfo } from "@/stores/server-info";
import { useSessionSocket } from './stores/session-socket';

(async () => {
	const loading = document.getElementById("connecting-box")!;
	const errorBox = document.getElementById("error-box")!;
	const errorMessage = document.getElementById("error-message")!;
	loading.style.display = "unset";

	const app = createApp(App);

	app.use(createPinia());
	app.use(router);

	const serverInfo = await useServerInfo();
	serverInfo.hostURL = __HOST_URL__;

	console.log("Server host: " + serverInfo.hostURL);

	const sessionSocket = await useSessionSocket();
	console.log("Session socket initialised, handshaking");
	sessionSocket.handShake()
		.then(() => {
			console.log("Handshake success");
			loading.remove();
			errorBox.remove();
			app.mount('#app');
		})
		.catch((error) => {
			loading.style.display = "none";
			errorMessage!.innerHTML = String(error);
			errorBox.style.display = "block";

			console.log("Handshake failed");
			console.error(error);
		});

})()

