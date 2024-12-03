<script setup lang="ts">
import RouterBar from "@/router/RouterBar.vue";
import { useSessionCredentialStore } from "@/stores/session-credential";
import { useThemeVars } from "naive-ui";
import router from "@/router";
import { onMounted, watch, computed } from "vue";

const themeVars = useThemeVars();
const backgroundColour = computed(() => themeVars.value.bodyColor);
watch(backgroundColour, () => {
	document.body.style.backgroundColor = backgroundColour.value;
});
document.body.style.backgroundColor = backgroundColour.value;


onMounted(async () => {
	const sessionCredentialStore = await useSessionCredentialStore();

	if (!sessionCredentialStore.logged) {
		router.push("/login");
	}
});

const routerViewColumns = computed(() => {
	console.log("routerViewLeft: " + router.currentRoute.value.path);
	if (router.currentRoute.value.path === "/login") {
		console.log("hide router bar");
		return "1 / 3";
	}
	else {
		return "2 / 3";
	}
});
</script>

<template>
	<div class="app">
		<RouterBar class="router-bar" />
		<div class="router-view" :style="{ gridColumn: routerViewColumns, background: backgroundColour }">
			<RouterView style="height: 100%; width: 100%;" v-slot="{ Component }">
				<Suspense>
					<div style="width: 100%; height: 100%;">
						<component :is="Component" />
					</div>
				</Suspense>
			</RouterView>
		</div>
	</div>
</template>

<style scoped>
.app {
	padding: 8px;
	width: 100%;
	height: 100%;

	display: grid;
	grid-template-columns: 10em 1fr;
	grid-template-rows: 1fr;
	gap: 8px;
}

.router-bar {
	grid-column: 1 / 2;
	grid-row: 1 / 2;

	min-height: 0;
	min-width: 0;
}

.router-view {
	grid-column: 2 / 3;
	grid-row: 1 / 2;

	min-height: 0;
	min-width: 0;
}
</style>
