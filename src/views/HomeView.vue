<script setup lang="ts">
import { useSessionCredentialStore } from '@/stores/session-credential';
import router from '@/router';

if (!useSessionCredentialStore().isLoggedIn()) {
	router.push("/login");
}
</script>

<template>
	<h1>Home</h1>
	<p>Hi {{  useSessionCredentialStore().userID }}</p>
	<p>something</p>
</template>
