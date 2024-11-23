<script setup lang="ts">
import { useSessionCredentialStore } from '@/stores/session-credential';
import { useRouterStore } from '@/stores/router-store';
import router from '@/router';
import { onMounted } from 'vue';
import { useLoadingBar, NH1, NP } from 'naive-ui';

const routerStore = useRouterStore();
const sessionCredential = await useSessionCredentialStore();

if (!sessionCredential.logged) {
	routerStore.redirect = "/";
	router.push("/login");
}

onMounted(() => {
	useLoadingBar().finish();
});
</script>

<template>
	<div>
		<n-h1>This is a Dashboard</n-h1>
		<n-p>Hi {{  sessionCredential.userID }}</n-p>
	</div>
</template>

<style scoped>
</style>
