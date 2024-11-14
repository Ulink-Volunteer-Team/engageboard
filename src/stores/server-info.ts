import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';
import localforage from 'localforage';

const storage = localforage.createInstance({
	name: "server-info",
	storeName: "server-info",
});

const initialValue = {
	ip: "127.0.0.1",
	protocol: "http",
	port: 3000
}

const storedValue = {
	ip: await storage.getItem<string>("ip"),
	protocol: await storage.getItem<string>("protocol"),
	port: await storage.getItem<number>("port")
}
export const useServerInfo = defineStore('server-info', () => {
	const protocol = ref(storedValue.protocol || initialValue.protocol);
	const ip = ref(storedValue.ip || initialValue.ip);
	const port = ref(storedValue.port || initialValue.port);

	const hostURL = computed(() => `${protocol.value}://${ip.value}:${port.value}`);
	watch(hostURL, async () => {
		await storage.setItem<string>("protocol", protocol.value);
		await storage.setItem<string>("ip", ip.value);
		await storage.setItem<number>("port", port.value);
	});
	return { ip, port, hostURL };
})
