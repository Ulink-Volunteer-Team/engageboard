<script setup lang="ts">
import { useSessionCredentialStore } from '@/stores/session-credential';
import { useRouterStore } from '@/stores/router-store';
import router from '@/router';

const routerStore = useRouterStore();
const sessionCredential = await useSessionCredentialStore();

if (!sessionCredential.logged) {
	routerStore.redirect = "/";
	router.push("/login");
}
</script>

<template>
	<div>
		<h1>Home</h1>
		<p>Hi {{  sessionCredential.userID }}</p>
		<p>something</p>
	</div>
</template>

<style scoped>
</style>
