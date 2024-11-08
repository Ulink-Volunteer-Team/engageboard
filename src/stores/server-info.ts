import {ref} from 'vue'
import {defineStore} from 'pinia'

export const useServerInfo = defineStore('server-info', () => {
	const ip = ref("");
	const port = ref(0);
	return {ip, port};
})
