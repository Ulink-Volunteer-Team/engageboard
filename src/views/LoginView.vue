<script setup lang="ts">
import { NCard, NForm, NFormItem, NInput, NButton, NFlex, useMessage, useLoadingBar } from "naive-ui";
import { ref, onMounted } from "vue";
import { useSessionSocket } from "@/stores/session-socket";
import { useSessionCredentialStore, clearSessionCredential } from "@/stores/session-credential";
import { login, getTokenState } from "@/utils/server-apis";
import { useRouterStore } from "@/stores/router-store";
import VueTurnstile from 'vue-turnstile';
import router from "@/router";
import { OnLocalHost } from "@/utils/utils";

const message = useMessage();

const turnstile_key = ref("");

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

const turnstileSiteKey = ref(__TURNSTILE_KEY__);
const turnstileRequired = !OnLocalHost();

if (!sessionCredential.logged) {
	if (sessionCredential.userID && sessionCredential.token) {
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
	else if (routerStore.redirect) {
		message.warning("Please log in first.");
	}
} else {
	router.push(routerStore.redirect || "/");
	routerStore.redirect = "";
}

function localLogin() {
	login(userCredential.value.userName, userCredential.value.password, turnstile_key.value, sessionSocket, sessionCredential)
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
					<n-flex :wrap="false" style="width: 100%;" vertical :size="16">
						<n-button @click="localLogin" class="login-button" type="primary">
							Login
						</n-button>
						<div class="turnstile" v-if="turnstileRequired">
						<vue-turnstile :site-key="turnstileSiteKey" v-model="turnstile_key"
							@error="message.error('Turnstile check failed')"
							@unsupported="message.error('Please switch a browser.')" />
						</div>

					</n-flex>
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
	width: min(50em, 100%);
	height: min(60em, 100%);
}

.login-button {
	width: 100%;
}

.turnstile {
	width: 300px;
	height: 4.5em;
	background-color: rgba(128, 128, 128, 0.5);
	content: "Turnstile";
}
</style>
