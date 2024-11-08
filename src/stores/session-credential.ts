import {ref} from 'vue'
import {defineStore} from 'pinia'

export const useSessionCredentialStore = defineStore('session-credential', () => {
	const token = ref("");
	const sessionID = ref("");
	const userName = ref("");

	function login(tokenObtained: string, sessionIDObtained: string, userNameLoggined: string){
		token.value = tokenObtained;
		sessionID.value = sessionIDObtained;
		userName.value = userNameLoggined;
	}

	const isLoggedIn = () => token.value !== "";
	return {token, sessionID, userName, login, isLoggedIn}
})
