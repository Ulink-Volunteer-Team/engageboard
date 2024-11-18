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
import { useRouterStore } from '@/stores/router-store';

const message = useMessage();
const dialog = useDialog();
const sessionCredential = await useSessionCredentialStore();
const sessionSocket = await useSessionSocket();

if (!sessionCredential.logged) {
	useRouterStore().redirect = "/students";
	router.push("/login");
}

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
		getStudentsByFuzzySearch(value, sessionSocket, sessionCredential)
			.then((result) => searchResult.value = result)
			.catch((error) => message.error("Fail to search the students: " + String(error).split(":").pop()!.trim()))
			.finally(() => loading.value = false);
	}, 500);
}

watch(searchName, updateSearchResult);

const newStudentDialogVisible = ref(false);
const openNewStudentDialog = () => newStudentDialogVisible.value = true;
const closeNewStudentDialog = () => newStudentDialogVisible.value = false;

const studentIDSearchDialogVisible = ref(false);
const openIDSearchDialog = () => studentIDSearchDialogVisible.value = true;
const closeIDSearchDialog = () => studentIDSearchDialogVisible.value = false;

const addStudentsLocal = (newStudentInfo: StudentType) => {
	if (!newStudentInfo.id || !newStudentInfo.name) {
		message.error("Invalid student info");
		return;
	}
	addStudents([newStudentInfo], sessionSocket, sessionCredential)
		.then(() => {
			updateSearchResult();
		})
		.catch(() => {
			message.error("API call failed on addStudents");
		})
		.finally(() => closeNewStudentDialog());
}

const getStudentByIDLocal = (studentID: string) => {
	if (!studentID) {
		message.error("Student ID cannot be empty");
		return;
	}
	getStudentByID(studentID, sessionSocket, sessionCredential)
		.then(({ name }) => {
			console.log(name);
			if (!name) {
				message.error(`No such student with ID: "${studentID}"`);
				return;
			}
			dialog.success({
				title: 'Search result',
				content: `Student with ID "${studentID}" is called "${name}"`,
				positiveText: 'Confirm',
			})
		})
		.catch(() => {

			message.error(`API call failed on getStudentByID`);
		})
		.finally(() => closeIDSearchDialog());
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
			if (selectedIds.value.length === 0) {
				message.error("Please select at least one student");
				return;
			}
			loading.value = true;
			removeStudent(selectedIds.value, sessionSocket, sessionCredential)
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
		icon: PersonAddAlt1Round,
		onClick: openNewStudentDialog,
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
		<!-- Search Bar -->
		<n-input type="text" v-model:value="searchName" placeholder="Search Name" class="search-bar" />

		<!-- Tool Bar -->
		<n-card content-style="padding: 8px;" class="tool-bar">
			<n-flex justify="left" :align="'center'" style="height: 2em;">
				<!-- Tool Bar Items -->
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

		<!-- Search Result -->
		<n-card content-style="padding: 0px;" class="search-result">
			<!-- No Data -->
			<div v-if="(searchResult.length === 0) && !loading"
				style="display: grid; place-items: center; height: 100%;">
				<n-empty :description="searchName === '' ? 'Please Input the Search Name' : 'No Data'" />
			</div>
			<!-- Data -->
			<n-data-table v-else v-model:checked-row-keys="selectedIds" :columns="columns" :data="searchResult"
				:row-key="row => row.id" :loading="loading" virtual-scroll flex-height style="height: 100%;"
				:bordered="false" />
		</n-card>

		<!-- Dialog -->
		<student-info-input v-model:visible="newStudentDialogVisible" @confirm="addStudentsLocal" />
		<single-prompt v-model:visible="studentIDSearchDialogVisible" title="Search by ID"
			prompt="Please input the student ID" @confirmed="getStudentByIDLocal" />
	</div>
</template>

<style scoped>
.outer-container {
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: 2em 3em auto;
	align-content: stretch;
	align-items: stretch;
	gap: 1em;
	padding: 1em;

	justify-items: center;
	align-items: center;
}

.search-bar {
	grid-column: 1 / 2;
	grid-row: 1 / 2;
}

.tool-bar {
	grid-column: 1 / 2;
	grid-row: 2 / 3;
	width: 100%;
}

.search-result {
	grid-column: 1 / 2;
	grid-row: 3 / 4;
	width: 100%;
	height: 100%;

	display: grid;
	align-content: stretch;
	align-items: stretch;
}
</style>
