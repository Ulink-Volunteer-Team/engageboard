import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import { useServerInfo } from "@/stores/server-info";
import { useSessionSocket } from './stores/session-socket';

const app = createApp(App);

app.use(createPinia());
app.use(router);

const serverInfo = await useServerInfo();
//serverInfo.ip = "83.229.127.91";
serverInfo.ip = "localhost";
serverInfo.port = 3000;

const sessionSocket = await useSessionSocket();
sessionSocket.handShake()
	.then(() => {
		console.log("Session socket initialised, handshake success");
		app.mount('#app');
	})
	.catch((error) => {
		console.error(error);
	});
