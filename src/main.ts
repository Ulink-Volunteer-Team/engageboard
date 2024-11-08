import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import { useSessionSocket } from './stores/session-socket';

const app = createApp(App);

app.use(createPinia());
app.use(router);

const sessionSocket = useSessionSocket();
sessionSocket.setBaseURL("http://localhost:3000");
sessionSocket.handShake()
.then(() => {
	console.log("Session socket initialised, handshake success");
	console.log(sessionSocket)
	app.mount('#app');
});
