<script setup lang="ts">
import { Icon } from "@vicons/utils";
import { DashboardRound/*, LogInRound*/, AccountBoxRound, EventNoteRound } from "@vicons/material"
import { NFlex, useLoadingBar } from "naive-ui";
import { RouterLink } from 'vue-router';
import { type Component } from "vue";

type RouterItemType = {
	icon: Component,
	to: string;
	title: string
}

const loadingBar = useLoadingBar();

const routers: RouterItemType[] = [
	{
		icon: DashboardRound,
		to: "/",
		title: "Dashboard"
	},
	// {
	// 	icon: LogInRound,
	// 	to: "/login",
	// 	title: "LogIn"
	// },
	{
		icon: AccountBoxRound,
		to: "students",
		title: "Students"
	},
	{
		icon: EventNoteRound,
		to: "recruitments",
		title: "Recruitments",
	}
];

const startLoadingBar = () => {
	loadingBar.start();
}
</script>

<template>
	<n-flex vertical>
		<RouterLink v-for="(router) in routers" :to="router.to" :title="router.title" :key="router.to"
			class="router-item" @click="startLoadingBar">
			<div
				style="display: flex; align-items: center; justify-content: center; grid-column: 1 / 2; grid-row: 1 / 2">
				<Icon :size="24">
					<component :is="router.icon"></component>
				</Icon>
			</div>
			<p style="font-size: 0.6em; grid-column: 2 / 3; grid-row: 1 / 2">{{ router.title }}</p>
		</RouterLink>
	</n-flex>
</template>

<style scoped>
.router-item {
	--item-height: 3em;
	--item-width: 9em;

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
	transition: 0.4s;
	padding: 3px;
}

.router-item:hover {
	background-color: hsla(160, 100%, 37%, 0.2);
	cursor: pointer;
}
</style>
