<script setup lang="ts">
import { ref, watch, type Component } from "vue";
import { useMessage, NEmpty, NInput, NDataTable, type DataTableColumns, NCard, NFlex, NButton, NIcon, useDialog } from 'naive-ui';
import { DeleteOutlineRound, PersonAddAlt1Round, SearchRound } from "@vicons/material"
import { useSessionSocket } from '@/stores/session-socket';
import { useSessionCredentialStore } from '@/stores/session-credential';
import router from '@/router';
import { type StudentType, getStudentsByFuzzySearch, removeStudent, addStudents, getStudentByID } from "@/utils/server-apis";
import StudentInfoInput from "@/components/StudentInfoInput.vue";
import SinglePrompt from "@/components/SinglePrompt.vue";

const message = useMessage();
const dialog = useDialog();

if (!useSessionCredentialStore().isLoggedIn()) {
	router.push("/login");
	setTimeout(() => message.warning("Please log in first"), 0);
}

const sessionSocket = useSessionSocket();
const searchName = ref<string>("");
const searchResult = ref<StudentType[]>([]);
const selectedIds = ref<string[]>([]);
const loading = ref(false);

let timer: number | undefined;
function updateSearchResult() {
	const value = searchName.value;
	loading.value = true;
	if (timer !== undefined) {
		clearTimeout(timer);
	}
	timer = window.setTimeout(() => {
		if (value === "") {
			searchResult.value = [];
			loading.value = false;
			return;
		}
		getStudentsByFuzzySearch(value, sessionSocket)
			.then((result) => searchResult.value = result)
			.catch((error) => message.error("Fail to search the students: " + String(error).split(":").pop()!.trim()))
			.finally(() => loading.value = false);
	}, 500);
}

watch(searchName, updateSearchResult);

watch(searchName, updateSearchResult);

const newStudentDialogVisible = ref(false);
const openDialog = () => newStudentDialogVisible.value = true;
const closeDialog = () => newStudentDialogVisible.value = false;

const studentIDSearchDialogVisible = ref(false);
const openIDSearchDialog = () => studentIDSearchDialogVisible.value = true;
const closeIDSearchDialog = () => studentIDSearchDialogVisible.value = false;

const addStudentsLocal = (newStudentInfo: StudentType) => {
	addStudents([newStudentInfo], sessionSocket)
		.then(() => {
			updateSearchResult();
			closeDialog();
		})
}

const getStudentByIDLocal = (studentID: string) => {
	getStudentByID(studentID, sessionSocket)
		.then((result) => {
			console.log(result);
			closeIDSearchDialog();
			dialog.success({
				title: 'Search result',
				content: `Student with ID "${studentID}" is called "${result.name}"`,
				positiveText: 'Confirm',
			})
		})
		.catch(() => message.error(`No such student with ID: "${studentID}"`))
}

const columns: DataTableColumns<StudentType> = [
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
		title: 'Name',
		key: 'name',
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
			loading.value = true;
			removeStudent(selectedIds.value, sessionSocket)
				.then(() => {
					selectedIds.value = [];
					updateSearchResult();
				})
		},
		critical: true
	},
	{
		title: "Add",
		icon: PersonAddAlt1Round,
		onClick: openDialog,
		critical: false
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
		<n-input type="text" v-model:value="searchName" placeholder="Search Name" class="search-bar" />
		<n-card content-style="padding: 8px;">
			<n-flex justify="left" :align="'center'" style="height: 2em;">
				<n-button strong secondary style="height: 2em; width: 2em;" v-for="item in toolBarItems"
					:key="item.title" @click="item.onClick" :type="(item.critical ? 'error' : 'primary')">
					<template #icon>
						<n-icon>
							<component :is="item.icon" />
						</n-icon>
					</template>
				</n-button>
			</n-flex>
		</n-card>
		<student-info-input v-model:dialog-visible="newStudentDialogVisible" :close-dialog="closeDialog"
			@student-info-confirmed="addStudentsLocal" />
		<single-prompt v-model:visible="studentIDSearchDialogVisible" title="Search by ID"
			prompt="Please input the student ID" :close-dialog="closeIDSearchDialog" @confirmed="getStudentByIDLocal" />
		<n-empty description="NO DATA" v-if="(searchResult.length === 0) && !loading" />
		<n-data-table v-else v-model:checked-row-keys="selectedIds" :columns="columns" :data="searchResult"
			:row-key="row => row.id" :loading="loading" virtual-scroll style="min-height: 100%" flex-height />
	</div>
</template>

<style scoped>
.outer-container {
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: 2em 3em auto;
	gap: 1em;
	padding: 1em;

	justify-items: center;
	align-items: center;
}

.search-bar {
	grid-column: 1 / 2;
	grid-row: 1 / 2;
}
</style>
