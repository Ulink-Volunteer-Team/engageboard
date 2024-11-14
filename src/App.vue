<script setup lang="ts">
import RouterBar from "@/router/RouterBar.vue";
import { NConfigProvider, NMessageProvider, NDialogProvider, NModalProvider } from "naive-ui";
import { useSessionCredentialStore } from "@/stores/session-credential";

const sessionCredentialStore = useSessionCredentialStore();

if (sessionCredentialStore.isLoggedIn()) {
}
</script>

<template>
	<n-config-provider>
		<n-message-provider>
			<n-modal-provider>
				<n-dialog-provider>
					<div class="app">
						<RouterBar class="router-bar" />
						<RouterView class="router-view" />
					</div>
				</n-dialog-provider>
			</n-modal-provider>
		</n-message-provider>
	</n-config-provider>
</template>

<style scoped>
.app {
	--margin: 8px;
	width: 100%;
	height: 100%;
	position: fixed;
}

.router-bar {
	position: absolute;
	top: var(--margin);
	bottom: var(--margin);
	left: var(--margin);
	width: 8em;
}

.router-view {
	position: absolute;
	top: var(--margin);
	bottom: var(--margin);
	left: 8em;
	right: var(--margin);
}
</style>
