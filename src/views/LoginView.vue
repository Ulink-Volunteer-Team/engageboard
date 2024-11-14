<script setup lang="ts">
import { NCard, NForm, NFormItem, NInput, NButton, useMessage } from "naive-ui";
import { ref } from "vue";
import { useSessionSocket } from "@/stores/session-socket";
import { useSessionCredentialStore, clearSessionCredential } from "@/stores/session-credential";
import { login, getTokenState } from "@/utils/server-apis";

const message = useMessage();

const userCredential = ref({
	userName: "",
	password: "",
});

const sessionSocket = useSessionSocket();
const sessionCredential = useSessionCredentialStore();

if(sessionCredential.isLoggedIn()) {
	getTokenState(sessionSocket)
	.then((data) => {
		if (data.valid) {
			message.success("Token is still valid");
		}
		else {
			message.error("Token is invalid");
			clearSessionCredential();
		}
	})
	.catch((error) => {
		message.error("Fail to get token state: " + String(error));
	});
}

function localLogin() {
	login(userCredential.value.userName, userCredential.value.password, sessionSocket, sessionCredential)
		.then(() => message.info("Login successful. Hi, " + userCredential.value.userName))
		.catch((error) => message.error(String(error)));
}
</script>

<template>
	<div class="outer-container">
		<NCard title="Login" class="login-card">
			<template #action>
				<p>Server API Version: {{ sessionSocket.serverAPIVersion || "Loading" }}</p>
			</template>

			<n-form ref="formRef" :model="userCredential" label-placement="left" label-width="auto">
				<n-form-item path="user-name" label="User ID">
					<n-input v-model:value="userCredential.userName" @keydown.enter.prevent type="text"
						placeholder="user@example.com" />
				</n-form-item>
				<n-form-item path="password" label="Password">
					<n-input type="password" show-password-on="mousedown" placeholder="password"
						v-model:value="userCredential.password" />
				</n-form-item>
				<n-form-item path="submit">
					<n-button @click="localLogin" class="login-button" type="primary">
						Login
					</n-button>
				</n-form-item>
			</n-form>
		</NCard>
	</div>
</template>

<style scoped>
.outer-container {
	width: 100%;
	height: 100%;

	display: grid;
	place-items: center;
	align-items: center;
}

.login-card {
	width: min(20em, 100%);
	height: min(30em, 100%);
}

.login-button {
	width: 100%;
}
</style>
