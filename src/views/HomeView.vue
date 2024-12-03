<script setup lang="ts">
import { useSessionCredentialStore } from '@/stores/session-credential';
import { useRouterStore } from '@/stores/router-store';
import router from '@/router';
import { onMounted } from 'vue';
import { useLoadingBar, NH1, NP, NA } from 'naive-ui';

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
	<div class="outer-container">
		<div style="padding-bottom: 8em; max-width: 48em;">
		<n-h1>This page is still a work in progress</n-h1>
		<n-p>We are currently working on it. Please check back later for updates.</n-p>
		<n-p>If you have some good ideas, whether big or small, please post them on our <n-a href="https://github.com/Ulink-Volunteer-Team/engageboard/issues">GitHub Issues</n-a>. They will make a great difference.</n-p>
		</div>
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
	overflow: hidden;
	animation: fade-in 0.3s ease-in;

	display: grid;
	place-content: center;
}
</style>
