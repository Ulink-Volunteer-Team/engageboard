<script setup lang="ts">
import RouterBar from "@/router/RouterBar.vue";
import { useSessionCredentialStore } from "@/stores/session-credential";
import { useThemeVars } from "naive-ui";
import router from "@/router";
import { onMounted, watch, computed, ref } from "vue";

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

const getRouterViewLeft = () => {
	if(router.currentRoute.value.path === "/login") {
		return "0em";
	}
	else {
		return "10em";
	}
};

const routerViewLeft = ref(getRouterViewLeft());
watch(router.currentRoute, () => {
	routerViewLeft.value = getRouterViewLeft();
});
</script>

<template>
	<div class="app">
		<RouterBar class="router-bar" />
		<div class="router-view" :style="{left: routerViewLeft, background: backgroundColour}">
			<RouterView style="height: 100%; width: 100%;" v-slot="{ Component }">
				<Suspense>
					<component :is="Component" />
				</Suspense>
			</RouterView>
		</div>
	</div>
</template>

<style scoped>
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
	right: var(--margin);
}
</style>
