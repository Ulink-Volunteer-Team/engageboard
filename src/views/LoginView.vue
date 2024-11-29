<script setup lang="ts">
import { NCard, NForm, NFormItem, NInput, NButton, useMessage, useLoadingBar } from "naive-ui";
import { ref, onMounted } from "vue";
import { useSessionSocket } from "@/stores/session-socket";
import { useSessionCredentialStore, clearSessionCredential } from "@/stores/session-credential";
import { login, getTokenState } from "@/utils/server-apis";
import { useRouterStore } from "@/stores/router-store";
import VueTurnstile from 'vue-turnstile';
import router from "@/router";

const message = useMessage();

const turnstile_key = "";

const userCredential = ref({
	userName: "",
	password: "",
});

const sessionSocket = await useSessionSocket();
const sessionCredential = await useSessionCredentialStore();
const routerStore = useRouterStore();

const redirect = () => {
	const redirectPath = routerStore.redirect;
	routerStore.redirect = "";
	router.push(redirectPath || "/");
};

const afterLogin = () => {
	sessionCredential.logged = true;
	redirect();
};

if (!sessionCredential.logged) {
	if(sessionCredential.userID && sessionCredential.token) {
		getTokenState(sessionSocket, sessionCredential)
			.then((data) => {
				if (data.valid) {
					console.log("Login successful, using stored token and user id");
					afterLogin();
				}
				else {
					message.error("Your login has expired. Please login again.");
					clearSessionCredential();
				}
			})
			.catch((error) => {
				message.error("Fail to get token state: " + String(error));
			});
	}
	else if(routerStore.redirect) {
		message.warning("Please log in first.");
	}
} else {
	router.push(routerStore.redirect || "/");
	routerStore.redirect = "";
}

function localLogin() {
	login(userCredential.value.userName, userCredential.value.password, turnstile_key, sessionSocket, sessionCredential)
		.then(() => {
			setTimeout(() => message.info("Login successful. Hi, " + userCredential.value.userName), 0);
			afterLogin();
		})
		.catch((error) => message.error(String(error)));
}

onMounted(() => {
	useLoadingBar().finish();
});
</script>

<template>
	<div class="outer-container">
		<NCard title="Login" class="login-card">
			<template #action>
				<p>Server API Version: {{ sessionSocket.serverAPIVersion || "Loading" }}</p>
			</template>

			<n-form ref="formRef" :model="userCredential" label-placement="top" label-width="auto">
				<n-form-item path="user-name" label="User ID">
					<n-input v-model:value="userCredential.userName" @keydown.enter.prevent type="text"
						placeholder="user@example.com" />
				</n-form-item>
				<n-form-item path="password" label="Password">
					<n-input type="password" show-password-on="mousedown" placeholder="password"
						v-model:value="userCredential.password" />
				</n-form-item>
				<n-form-item path="submit">
					<template>
						<div>
							<vue-turnstile site-key=__TURNSTILE_KEY__ v-model="turnstile_key" @error="message.error('Turnstile check failed')" @unsupported="message.error('Please switch a browser.')" />
						</div>
					</template>
					<n-button @click="localLogin" class="login-button" type="primary">
						Login
					</n-button>
				</n-form-item>
			</n-form>
		</NCard>
	</div>
</template>

<style scoped>
@keyframes fade-in {
	0% {
		opacity: 0;
	}

	30% { 	
		opacity: 0;
	}

	100% {
		overflow: 1;
	}
}

.outer-container {
	width: 100%;
	height: 100%;

	display: grid;
    place-content: center;
	animation: fade-in 0.3s ease-in;
}

.login-card {
	width: min(20em, 100%);
	height: min(30em, 100%);
}

.login-button {
	width: 100%;
}
</style>
