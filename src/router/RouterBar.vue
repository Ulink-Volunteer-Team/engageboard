<script setup lang="ts">
import { Icon } from "@vicons/utils";
import { DashboardRound/*, LogInRound*/, AccountBoxRound, EventNoteRound } from "@vicons/material";
import { LogoGithub } from "@vicons/carbon";
import { NFlex, useLoadingBar } from "naive-ui";
import { RouterLink, useRouter } from 'vue-router';
import { type Component } from "vue";

const router = useRouter();

type RouterItemType = {
	icon: Component,
	to: string;
	title: string
}

const loadingBar = useLoadingBar();

const inSamePage = (to: string) => {
	return to.split("/").pop() === router.currentRoute.value.path.split("/").pop();
};

const routers: RouterItemType[] = [
	{
		icon: DashboardRound,
		to: "/",
		title: "Dashboard",
	},
	// {
	// 	icon: LogInRound,
	// 	to: "/login",
	// 	title: "LogIn"
	// },
	{
		icon: AccountBoxRound,
		to: "students",
		title: "Students",
	},
	{
		icon: EventNoteRound,
		to: "recruitments",
		title: "Recruitments",
	},
];

const routerLinks: RouterItemType[] = [
	{
		icon: LogoGithub,
		to: "https://github.com/Ulink-Volunteer-Team/engageboard",
		title: "Github Repo",
	},
	{
		icon: LogoGithub,
		to: "https://github.com/Ulink-Volunteer-Team/volunstats",
		title: "VolunStats",
	},
];

router.beforeEach((to, from) => {
	if (from.path === to.path) {
		loadingBar.finish();
		return;
	}
	loadingBar.start();
});
</script>

<template>
	<div class="router-bar" :style="{ '--github-links-num': routerLinks.length }">
		<n-flex vertical style="grid-area: 1 / 1 / 2 / 2;">
			<RouterLink v-for="(router) in routers" :to="router.to" :title="router.title" :key="router.to"
				:class='["router-item", inSamePage(router.to) ? "router-item-active" : ""]'>
				<div class="router-item-icon">
					<Icon :size="24"><component :is="router.icon" /></Icon>
				</div>
				<p class="router-item-title">{{ router.title }}</p>
			</RouterLink>
		</n-flex>
		<n-flex vertical style="grid-area: 2 / 1 / 3 / 2;">
			<a v-for ="(router) in routerLinks" :key="router.to" :href="router.to" target="_blank" class="router-item" :title="router.title">
				<div class="router-item-icon">
					<Icon :size="24"><component :is="router.icon" /></Icon>
				</div>
				<p class="router-item-title">{{ router.title }}</p>
			</a>
		</n-flex>
	</div>
</template>

<style scoped>
.router-bar {
	--item-height: 3em;
	--item-width: 10em;
	--hover-color: hsla(160, 100%, 37%, 0.2);
	--active-color: hsla(160, 100%, 37%, 0.3);
	--github-links-num: 0;

	width: 100%;
	height: 100%;

	display: grid;

	grid-template-columns: 1fr;
	grid-template-rows: auto calc(calc(var(--item-height) * var(--github-links-num)) + calc(8px * calc(var(--github-links-num) - 1)));
}


.router-item {
	height: var(--item-height);
	width: var(--item-width);

	display: grid;
	align-items: center;
	justify-content: center;

	grid-template-rows: 100%;
	grid-template-columns: var(--item-height) calc(var(--item-width) - var(--item-height));

	border-radius: 4px;

	text-decoration: none;
	color: hsla(160, 100%, 37%, 1);
	transition: 0.3s;
}

.router-item:hover:not(.router-item-active) {
	background-color: var(--hover-color);
	cursor: pointer;
}

.router-item-active {
	background-color: var(--active-color);
	box-shadow: 0 0 16px -8px var(--active-color);
}

.router-item-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	grid-column: 1 / 2;
	grid-row: 1 / 2
}

.router-item-title {
	grid-column: 2 / 3;
	grid-row: 1 / 2;

	font-weight: bold;
	font-size: small;

	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>
