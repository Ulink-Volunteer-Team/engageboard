<script setup lang="ts">
import {NCard, NForm, NFormItem, NInput} from "naive-ui";
import { ref} from "vue";
import {useSessionSocket} from "@/stores/session-socket";


const userCredential = ref({
	userName: "",
	password: "",
});

const sessionSocket = useSessionSocket();
</script>

<template>
	<div class="outer-container">
	<NCard title="Login" class="login-card">
		<template #action>
			Server API Version: {{sessionSocket.serverAPIVersion || "Loading"}}
		</template>

		<n-form ref="formRef" :model="userCredential">
			<n-form-item path="user-name" label="User Name">
				<n-input v-model:value="userCredential.userName" @keydown.enter.prevent type="text" />
			</n-form-item>
			<n-form-item path="password" label="Password">
				<n-input
					v-model:value="userCredential.password"
					type="password"
					show-password-on="click"
					@keydown.enter.prevent
				/>
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
</style>
