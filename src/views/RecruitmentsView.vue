<script setup lang="ts">
import { useSessionCredentialStore } from '@/stores/session-credential';
import { useRouterStore } from '@/stores/router-store';
import router from '@/router';

const routerStore = useRouterStore();
const sessionCredential = await useSessionCredentialStore();

if (!sessionCredential.logged) {
	routerStore.redirect = "/recruitments";
	router.push("/login");
}
</script>

<template>
	<div>NOT IMPLEMENTED YET</div>
</template>

<style scoped>

</style>
