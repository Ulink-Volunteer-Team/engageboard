<script setup lang="ts">
import RouterBar from "@/router/RouterBar.vue";
import {NConfigProvider, darkTheme} from "naive-ui";
import {useSessionCredentialStore} from "@/stores/session-credential";

const sessionCredentialStore = useSessionCredentialStore();

if(sessionCredentialStore.isLoggedIn()) {}
</script>

<template>

	<div class="app">
	<RouterBar class="router-bar"/>
		<n-config-provider :theme="darkTheme">
	<RouterView class="router-view"/>
		</n-config-provider>
	</div>

</template>

<style scoped>
.app {
	width: 100%;
	height: 100%;
	position: relative;

	margin: 8px;
	box-sizing: border-box;
}

.router-bar {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	width: 8em;
}

.router-view {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 8em;
	right: 0;
}
</style>
