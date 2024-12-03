<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NDialogProvider, NModalProvider, NLoadingBarProvider, useOsTheme, lightTheme, darkTheme } from "naive-ui";
import { computed } from "vue";
import AppBase from "./components/AppBase.vue";

const theme = computed(() => ((useOsTheme().value === "dark") ? darkTheme : lightTheme));
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
