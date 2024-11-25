<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NDialogProvider, NModalProvider, NLoadingBarProvider, useOsTheme, lightTheme, darkTheme } from "naive-ui";
import { useSessionCredentialStore } from "@/stores/session-credential";
import router from "./router";
import { onMounted, computed } from "vue";
import AppBase from "./components/AppBase.vue";

const theme = computed(() => ((useOsTheme().value === "dark") ? darkTheme : lightTheme));

onMounted(async () => {
	const sessionCredentialStore = await useSessionCredentialStore();

	if (!sessionCredentialStore.logged) {
		router.push("/login");
	}
});
</script>

<template>
	<n-config-provider style="width: 100%; height: 100%;" :theme=theme>
		<n-loading-bar-provider>
			<n-message-provider>
				<n-modal-provider>
					<n-dialog-provider>
						<AppBase />
					</n-dialog-provider>
				</n-modal-provider>
			</n-message-provider>
		</n-loading-bar-provider>
	</n-config-provider>
</template>
