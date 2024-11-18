<script setup lang="ts">
import { ref, type Component, computed } from "vue";
import { useMessage, NEmpty, NSelect, NInput, NDataTable, type DataTableColumns, NCard, NFlex, NButton, NIcon, NDynamicInput, NSplit, NList, NListItem } from 'naive-ui';
import { DeleteOutlineRound, PostAddRound, SearchRound, ManageSearchRound } from "@vicons/material"
import { useSessionSocket } from '@/stores/session-socket';
import { useSessionCredentialStore } from '@/stores/session-credential';
import router from '@/router';
import { type RecruitmentDataType, getRecruitmentsByFuzzySearch, addRecruitments, deleteRecruitments, getRecruitmentByID } from "@/utils/server-apis";
import RecruitmentInput from "@/components/RecruitmentInput.vue";
import SinglePrompt from "@/components/SinglePrompt.vue";
import { useRouterStore } from '@/stores/router-store';
import RecruitmentDisplayDialog from "@/components/RecruitmentDisplayDialog.vue";
import RecruitmentInfoDisplay from "@/components/RecruitmentInfoDisplay.vue";

const message = useMessage();
const sessionCredential = await useSessionCredentialStore();
const sessionSocket = await useSessionSocket();

if (!sessionCredential.logged) {
	useRouterStore().redirect = "/recruitments";
	router.push("/login");
}

const searchCriteria = ref<{ key: string, value: string }[]>([]);
const searchOptions = ref([{
	label: "Event Name",
	value: "eventName"
}, {
	label: "Form Filled By",
	value: "formFilledBy"
}, {
	label: "Department",
	value: "department"
}]);
const searchResult = ref<RecruitmentDataType[]>([]);
const selectedIds = ref<string[]>([]);
const loading = ref(false);

let timer: number | undefined;
function updateSearchResult() {
	if (searchCriteria.value.length < 1) return;
	const values = searchCriteria.value.map(({ value }) => value).filter(value => value !== "");
	const fields = searchCriteria.value.map(({ key }) => key).filter(value => value !== "");
	loading.value = true;
	if (timer !== undefined) {
		clearTimeout(timer);
	}
	timer = window.setTimeout(() => {
		if (values.length === 0 || fields.length === 0) {
			searchResult.value = [];
			loading.value = false;
			return
		}
		for (let i = 0; i < fields.length; i++) {
			const field = fields[i];

			if (!["eventName", "formFilledBy", "department"].includes(field)) {
				message.error("Invalid search field");
				loading.value = false;
				return
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

const selectedRecruitments = computed(() => searchResult.value.filter(({ id }) => id ? selectedIds.value.includes(id) : false));

const addRecruitmentLocal = (newRecruitmentInfo: RecruitmentDataType) => {
	addRecruitments([newRecruitmentInfo], sessionSocket, sessionCredential)
		.then(() => {
			updateSearchResult();
		})
		.catch(() => {
			message.error("API call failed on addRecruitments");
		})
		.finally(() => closeNewRecruitmentDialog());
}

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
}

const columns: DataTableColumns<RecruitmentDataType> = [
	{
		type: 'selection',
		fixed: 'left',
		options: [
			"all",
			"none",
		]
	},
	{
		title: 'ID',
		key: 'id',
		maxWidth: 200,
		minWidth: 100,
		fixed: 'left'
	},
	{
		title: 'Event Name',
		key: 'eventName',
		maxWidth: 300,
		minWidth: 200,
		fixed: 'left'
	},
];

const toolBarItems: Array<{ title: string, icon: Component, onClick: () => void, critical: boolean }> = [
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
					message.error(String(error))
				})
		},
		critical: true
	},
	{
		title: "Add",
		icon: PostAddRound,
		onClick: openNewRecruitmentDialog,
		critical: false
	},
	{
		title: "Search",
		icon: ManageSearchRound,
		onClick: updateSearchResult,
		critical: false,
	},
	{
		title: "Search ID",
		icon: SearchRound,
		onClick: openIDSearchDialog,
		critical: false
	}
];
</script>

<template>
	<div class="outer-container">
		<n-split direction="horizontal" style="height: 100%;" pane2-style="overflow: visible;"
		:max="0.8" :min="0.2" :default-size="0.7">
			<template #1>
				<!-- Search Result -->
				<n-card content-style="padding: 0px;" class="search-result">
					<!-- No Data -->
					<div v-if="(searchResult.length === 0) && !loading"
						style="display: grid; place-items: center; height: 100%;">
						<n-empty
							:description="searchCriteria.length === 0 ? 'Please Input the Search Data' : 'No Data'" />
					</div>
					<!-- Data -->
					<n-data-table v-else v-model:checked-row-keys="selectedIds" :columns="columns" :data="searchResult"
						:row-key="row => row.id" :loading="loading" virtual-scroll flex-height style="height: 100%;"
						:bordered="false" />
				</n-card>
			</template>

			<template #resize-trigger>
				<div class="resize-trigger-vertical resize-trigger"></div>
			</template>

			<template #2>
				<n-split direction="vertical" style="height: 100%;" :max="0.5" :min="0.1" :default-size="0.3">
					<template #1>
						<!-- filter -->
						<n-card content-style="overflow: auto; padding: 0px;" class="search-bar" size="small"
							title="Search Criteria">
							<n-dynamic-input preset="pair" style="overflow: auto; padding: 8px;"
								v-model:value="searchCriteria" :on-create="() => ({ key: '', value: '' })">
								<template #default="{ value }">
									<div style="display: flex; align-items: center; width: 100%">
										<n-flex :wrap="false" style="width: 100%;">
											<n-select v-model:value="value.key" :options="searchOptions" />
											<n-input v-model:value="value.value" type="text" />
										</n-flex>
									</div>
								</template>
							</n-dynamic-input>
							<template #footer>
								<n-flex :wrap="false">
									<n-button strong secondary style="height: 2em; width: 2em;"
										v-for="item in toolBarItems" :key="item.title" @click="item.onClick"
										:type="(item.critical ? 'error' : 'primary')">
										<template #icon>
											<n-icon>
												<component :is="item.icon" />
											</n-icon>
										</template>
									</n-button>
								</n-flex>
							</template>
						</n-card>

						<n-card content-style="padding: 8px;" class="tool-bar">
							<n-flex justify="left" :align="'center'" style="height: 2em;">
								<!-- Tool Bar Items -->
								<n-button strong secondary style="height: 2em; width: 2em;" v-for="item in toolBarItems"
									:key="item.title" @click="item.onClick"
									:type="(item.critical ? 'error' : 'primary')">
									<template #icon>
										<n-icon>
											<component :is="item.icon" />
										</n-icon>
									</template>
								</n-button>
							</n-flex>
						</n-card>
					</template>

					<template #resize-trigger>
						<div class="resize-trigger-horizontal resize-trigger"></div>
					</template>
					<template #2>
						<n-card content-style="padding: 0px; overflow: hidden;" class="search-result">
							<div v-if="selectedRecruitments.length === 0 || searchCriteria.length === 0"
							style="display: grid; place-items: center; height: 100%; width: 100%;">
								<n-empty description="Please Select a Recruitment or Input Search Criteria" />
							</div>
							<div style="padding: 16px; height: 100%; width: 100; overflow: auto;" v-else>
								<p style="position: sticky; top: -16px; z-index: 9999; background-color: var(--n-color); padding: 8px;">Selected {{ selectedRecruitments.length }} Relevant Recruitments</p>
								<n-list :show-divider="true" style="overflow: auto">
									<n-list-item v-for="recruitment in selectedRecruitments" :key="recruitment.id">
										<div><recruitment-info-display :recruitment="recruitment"/></div>
									</n-list-item>
								</n-list>
							</div>
						</n-card>
					</template>
				</n-split>
			</template>
		</n-split>

		<!-- Dialog -->
		<recruitment-input v-model:visible="newRecruitmentDialogVisible" @confirm="addRecruitmentLocal" />
		<single-prompt v-model:visible="recruitmentIDSearchDialogVisible" title="Search by ID"
			prompt="Please input the recruitment ID" @confirmed="getRecruitmentByIDLocal"
			placeholder="Recruitment ID" />
		<recruitment-display-dialog v-model:visible="recruitmentDisplayDialogVisible"
			:recruitment="selectedRecruitments[0]" />
	</div>
</template>

<style scoped>
.outer-container {
	height: 100%;
	width: 100%;
}

.search-bar {
	height: calc(100% - 8px);
	width: calc(100% - 8px);
	margin: 4px;
}

.search-result {
	height: calc(100% - 8px);
	width: calc(100% - 8px);
	margin: 4px;
}

.resize-trigger {
	background-color: transparent;
	transition: all 0.2s;
	border-radius: 2px;
	box-shadow: none;
}

.resize-trigger-vertical {
	width: 4px;
	height: 100%;
	cursor: ew-resize;
}

.resize-trigger-horizontal {
	width: 100%;
	height: 4px;
	cursor: ns-resize;
}

.resize-trigger:hover {
	background-color: var(--n-resize-trigger-color-hover);
	box-shadow: 0 0 16px 0px var(--n-resize-trigger-color-hover);
}
</style>
