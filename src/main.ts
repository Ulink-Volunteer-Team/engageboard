import './assets/base.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import { useServerInfo } from "@/stores/server-info";
import { useSessionSocket } from './stores/session-socket';

(async () => {
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
			console.log("Session socket initialised, handshake success");
			document.getElementById("connecting")!.remove();
			app.mount('#app');
		})
		.catch((error) => {
			console.error(error);
		});

})()

