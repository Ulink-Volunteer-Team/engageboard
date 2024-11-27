<script setup lang="ts">
import { ref, type Component, type Ref, computed, watch, onMounted } from "vue";
import { useMessage, NEmpty, NSelect, NInput, NDataTable, type DataTableColumns, NCard, NFlex, NButton, NIcon, NDynamicInput, NSplit, NTooltip, NSwitch, useLoadingBar } from 'naive-ui';
import { DeleteOutlineRound, PostAddRound, SearchRound, ManageSearchRound, EditNoteRound } from "@vicons/material";
import { useSessionSocket } from '@/stores/session-socket';
import { useSessionCredentialStore } from '@/stores/session-credential';
import router from '@/router';
import { type RecruitmentDataType, getRecruitmentsByFuzzySearch, addRecruitments, deleteRecruitments, getRecruitmentByID } from "@/utils/server-apis";
import RecruitmentInput from "@/components/RecruitmentInput.vue";
import SinglePrompt from "@/components/SinglePrompt.vue";
import { useRouterStore } from '@/stores/router-store';
import RecruitmentDisplayDialog from "@/components/RecruitmentDisplayDialog.vue";
import RecruitmentInfoDisplay from "@/components/RecruitmentInfoDisplay.vue";
import StudentSelectorDialog from "@/components/StudentSelectorDialog.vue";
import RecruitmentEditDialog from "@/components/RecruitmentEditDialog.vue";

const message = useMessage();
const sessionCredential = await useSessionCredentialStore();
const sessionSocket = await useSessionSocket();

if (!sessionCredential.logged) {
	useRouterStore().redirect = "/recruitments";
	router.push("/login");
}

const searchFilter = ref<{ key: string, value: string }[]>([]);
const searchOptions = ref([{
	label: "Event Name",
	value: "eventName",
}, {
	label: "Form Filled By",
	value: "formFilledBy",
}, {
	label: "Department",
	value: "department",
}]);
const searchResult = ref<RecruitmentDataType[]>([]);
const selectedIds = ref<string[]>([]);
const loading = ref(false);

const tableMultipleSelection = ref(false);
watch(tableMultipleSelection, () => {
	if (tableMultipleSelection.value == false && selectedIds.value.length > 0) {
		selectedIds.value = selectedIds.value.slice(0, 1);
	}
});

let timer: number | undefined;
function updateSearchResult() {
	if (searchFilter.value.length < 1) return;
	const values = searchFilter.value.map(({ value }) => value).filter(value => value !== "");
	const fields = searchFilter.value.map(({ key }) => key).filter(value => value !== "");
	loading.value = true;
	if (timer !== undefined) {
		clearTimeout(timer);
	}
	timer = window.setTimeout(() => {
		if (values.length === 0 || fields.length === 0) {
			searchResult.value = [];
			loading.value = false;
			return;
		}
		for (let i = 0; i < fields.length; i++) {
			const field = fields[i];

			if (!["eventName", "formFilledBy", "department"].includes(field)) {
				message.error("Invalid search field");
				loading.value = false;
				return;
			}
		}
		getRecruitmentsByFuzzySearch(values, (fields as ("eventName" | "formFilledBy" | "department")[]), sessionSocket, sessionCredential)
			.then((result) => searchResult.value = result)
			.catch((error) => message.error("Fail to search the recruitment: " + String(error).split(":").pop()!.trim()))
			.finally(() => loading.value = false);
	}, 500);
}

const newRecruitmentDialogVisible = ref(false);
const openNewRecruitmentDialog = () => newRecruitmentDialogVisible.value = true;
const closeNewRecruitmentDialog = () => newRecruitmentDialogVisible.value = false;

const recruitmentIDSearchDialogVisible = ref(false);
const openIDSearchDialog = () => recruitmentIDSearchDialogVisible.value = true;
const closeIDSearchDialog = () => recruitmentIDSearchDialogVisible.value = false;

const recruitmentDisplayDialogVisible = ref(false);
const studentSelectorDialogVisible = ref(false);

const recruitmentEditDialogVisible = ref(false);

const selectedRecruitments = computed(() => searchResult.value.filter(({ id }) => id ? selectedIds.value.includes(id) : false));
const studentsToAdd = ref<string[]>([]);

const addRecruitmentLocal = (newRecruitmentInfo: RecruitmentDataType) => {
	addRecruitments([newRecruitmentInfo], sessionSocket, sessionCredential)
		.then(() => {
			updateSearchResult();
		})
		.catch(() => {
			message.error("API call failed on addRecruitments");
		})
		.finally(() => closeNewRecruitmentDialog());
};

const getRecruitmentByIDLocal = (id: string) => {
	if (!id) {
		message.error("Recruitment ID cannot be empty");
		return;
	}
	getRecruitmentByID(id, sessionSocket, sessionCredential)
		.then((recruitment) => {
			if (!recruitment) {
				message.error(`No such recruitment with ID: "${id}"`);
				return;
			}

			if (selectedIds.value.includes(id)) selectedIds.value = selectedIds.value.filter(selectedId => selectedId !== id);
			selectedIds.value.unshift(id);

			if (searchResult.value.some(({ id }) => id === recruitment.id)) searchResult.value = searchResult.value.filter(({ id }) => id !== recruitment.id);
			searchResult.value.unshift(recruitment);
			recruitmentDisplayDialogVisible.value = true;
		})
		.catch(() => {

			message.error(`API call failed on getRecruitmentByID`);
		})
		.finally(() => closeIDSearchDialog());
};

const columns = computed(() => [
	{
		type: 'selection',
		fixed: 'left',
		multiple: tableMultipleSelection.value,
		options: [
			"all",
			"none",
		],
	},
	{
		title: 'ID',
		key: 'id',
		maxWidth: 200,
		minWidth: 100,
		fixed: 'left',
	},
	{
		title: 'Event Name',
		key: 'eventName',
		maxWidth: 300,
		minWidth: 200,
		fixed: 'left',
	},
]);

type ToolBarItemType = {
	title: string,
	icon: Component,
	onClick: () => void,
	critical: boolean,
	disabled?: boolean
}

const notAvailableLabel = (label: string, source: Ref<boolean>, not: boolean = false) => computed(() => (not ? !source.value : source.value) ? `${label} (Not Available in Multiple Selection)` : label);
const toolBarItems = computed<ToolBarItemType[]>(() => [
	{
		title: "Delete",
		icon: DeleteOutlineRound,
		onClick: () => {
			if (selectedIds.value.length === 0) {
				message.error("Please select at least one recruitment");
				return;
			}
			loading.value = true;
			deleteRecruitments(selectedIds.value, sessionSocket, sessionCredential)
				.then(() => {
					selectedIds.value = [];
					updateSearchResult();
				})
				.catch((error) => {
					loading.value = false;
					message.error(String(error));
				});
		},
		critical: true,
	},
	{
		title: "Add",
		icon: PostAddRound,
		onClick: openNewRecruitmentDialog,
		critical: false,
	},
	{
		title: "Search by Filter",
		icon: ManageSearchRound,
		onClick: updateSearchResult,
		critical: false,
	},
	{
		title: "Search by ID",
		icon: SearchRound,
		onClick: openIDSearchDialog,
		critical: false,
	},
	{
		title: notAvailableLabel("Edit", tableMultipleSelection).value,
		icon: EditNoteRound,
		onClick: () => {
			if (selectedRecruitments.value.length === 0) {
				message.error("Please select at least one recruitment");
				return;
			}
			recruitmentEditDialogVisible.value = true;
		},
		critical: false,
		disabled: tableMultipleSelection.value,
	},
]);

onMounted(() => {
	useLoadingBar().finish();
});
</script>

<template>
	<div class="outer-container">
		<n-split direction="vertical" style="height: 100%;" :max="0.7" :min="0.2" :default-size="0.4"
			pane1-style="overflow: visible; min-width: 0;">
			<template #1>
				<!-- Search Filter & Recruitment Details-->
				<n-split direction="horizontal" style="height: 100%; overflow: visible;" :max="0.7" :min="0.3"
					:default-size="0.4">
					<template #1>
						<!-- Filter -->
						<div class="filter-tools-container">
							<n-card content-style="padding: 0px;" class="search-bar" size="small" title="Search Filter">
								<n-dynamic-input preset="pair" style="padding: 8px; overflow-x: auto; height: 100%;"
									v-model:value="searchFilter" :on-create="() => ({ key: '', value: '' })"
									item-style="width: max(100%, fit-content);">
									<template #default="{ value }">
										<div style="display: flex; align-items: center;">
											<n-flex :wrap="false" style="width: 100%;">
												<n-select v-model:value="value.key" :options="searchOptions"
													style="min-width: 6em;" />
												<n-input v-model:value="value.value" type="text"
													style="min-width: 3em;" />
											</n-flex>
										</div>
									</template>
								</n-dynamic-input>
							</n-card>
							<!-- tool bar -->
							<n-card class="tool-bar" style="padding: 8px; min-width: 0; min-height:0; overflow-x: auto;"
								content-style="padding: 0px;">
								<n-flex :wrap="false" justify="left" :align="'center'">
									<n-tooltip trigger="hover" v-for="item in toolBarItems" :key="item.title">
										<template #trigger>
											<n-button strong secondary style="height: 2em; width: 2em;"
												@click="item.onClick" :type="(item.critical ? 'error' : 'primary')"
												:disabled="item.disabled || false">
												<template #icon><n-icon>
														<component :is="item.icon" />
													</n-icon></template>
											</n-button>
										</template>
										<span>{{ item.title }}</span>
									</n-tooltip>
									<n-tooltip trigger="hover">
										<template #trigger>
											<n-switch v-model:value="tableMultipleSelection" />
										</template>
										<span>Multiple Selection</span>
									</n-tooltip>
								</n-flex>
							</n-card>
						</div>
					</template>

					<template #resize-trigger>
						<div class="resize-trigger-horizontal resize-trigger"></div>
					</template>

					<!-- Recruitment Details -->
					<template #2>
						<n-card size="small" class="search-result" content-style="min-width: 0; min-height:0;">
							<div v-if="selectedRecruitments.length === 0 || searchFilter.length === 0"
								style="display: grid; height: 100%; width: 100%;">
								<n-empty description="Please Select a Recruitment or Input Search Filter" />
							</div>
							<div style="height: 100%; width: 100; overflow-x: scroll;" v-else>
								<recruitment-info-display :recruitment="selectedRecruitments[0]" />
							</div>
						</n-card>
					</template>
				</n-split>
			</template>

			<template #2>
				<!-- Search Result -->
				<n-data-table v-model:checked-row-keys="selectedIds" :columns="(columns as DataTableColumns)"
					:data="searchResult" :row-key="row => row.id" :loading="loading" virtual-scroll flex-height
					class="search-result" />
			</template>

			<template #resize-trigger>
				<div class="resize-trigger-vertical resize-trigger"></div>
			</template>
		</n-split>

		<!-- Dialog -->
		<recruitment-input v-model:visible="newRecruitmentDialogVisible" @confirm="addRecruitmentLocal" />
		<single-prompt v-model:visible="recruitmentIDSearchDialogVisible" title="Search by ID"
			prompt="Please input the recruitment ID" @confirmed="getRecruitmentByIDLocal"
			placeholder="Recruitment ID" />
		<recruitment-display-dialog v-model:visible="recruitmentDisplayDialogVisible"
			:recruitment="selectedRecruitments[0]" />
		<student-selector-dialog v-model:visible="studentSelectorDialogVisible" v-model:value="studentsToAdd" />
		<recruitment-edit-dialog v-model:visible="recruitmentEditDialogVisible" :recruitmentID="selectedRecruitments[0]?.id" @confirmed="updateSearchResult"/>
	</div>
</template>

<style scoped>
.outer-container {
	height: 100%;
	width: 100%;
	animation: fade-in 0.3s ease-in;
}

.tool-bar {
	grid-column: 1 / 2;
	grid-row: 2 / 3;
	height: 100%;
	width: 100%;
}

.search-bar {
	grid-column: 1 / 2;
	grid-row: 1 / 2;
	height: 100%;
	width: 100%;
	min-height: 0;
	min-width: 0;
	overflow-y: auto;
}

.filter-tools-container {
	margin: 4px;
	height: calc(100% - 8px);
	width: calc(100% - 8px);

	display: grid;
	gap: 8px;
	grid-template-columns: 1fr;
	grid-template-rows: 1fr 3em;
}

.search-result {
	height: calc(100% - 8px);
	width: calc(100% - 8px);
	margin: 4px;
	min-width: 0;
	min-height: 0;
	overflow-x: auto;
}

.resize-trigger {
	background-color: transparent;
	transition: all 0.2s;
	border-radius: 2px;
	box-shadow: none;
}

.resize-trigger-vertical {
	width: 100%;
	height: 4px;
	cursor: ns-resize;
}

.resize-trigger-horizontal {
	width: 4px;
	height: 100%;
	cursor: ew-resize;

}

.resize-trigger:hover {
	background-color: var(--n-resize-trigger-color-hover);
	box-shadow: 0 0 16px 0px var(--n-resize-trigger-color-hover);
}

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
</style>
