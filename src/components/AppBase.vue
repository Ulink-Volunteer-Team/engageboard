<script setup lang="ts">
import RouterBar from "@/router/RouterBar.vue";
import { useSessionCredentialStore } from "@/stores/session-credential";
import { useThemeVars } from "naive-ui";
import router from "@/router";
import { onMounted, computed } from "vue";

const themeVars = useThemeVars();
const backgroundColour = computed(() => themeVars.value.bodyColor);

onMounted(async () => {
	const sessionCredentialStore = await useSessionCredentialStore();

	if (!sessionCredentialStore.logged) {
		router.push("/login");
	}
});
</script>

<template>
	<div class="app" :style="{ backgroundColor: backgroundColour }">
		<RouterBar class="router-bar" />
		<div class="router-view">
			<RouterView style="height: 100%; width: 100%;" v-slot="{ Component }">
				<Suspense>
					<component :is="Component" />
				</Suspense>
			</RouterView>
		</div>
	</div>
</template>

<style>
.app {
	--margin: 8px;
	width: 100%;
	height: 100%;
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
	left: 10em;
	right: var(--margin);
}
</style>
