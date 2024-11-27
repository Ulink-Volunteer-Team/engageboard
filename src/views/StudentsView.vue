<script setup lang="ts">
import { ref, watch, type Component, type Ref, onMounted, computed } from "vue";
import { useMessage, NEmpty, NInput, NDataTable, type DataTableColumns, NTooltip, NSwitch, NSplit, NCard, NFlex, NButton, NIcon, useDialog, useLoadingBar } from 'naive-ui';
import { DeleteOutlineRound, PersonAddAlt1Round, SearchRound, EditNoteRound } from "@vicons/material";
import { useSessionSocket } from '@/stores/session-socket';
import { useSessionCredentialStore } from '@/stores/session-credential';
import router from '@/router';
import { type StudentType, getStudentsByFuzzySearch, removeStudent, addStudents, getStudentByID } from "@/utils/server-apis";
import StudentInfoInput from "@/components/StudentInfoInput.vue";
import StudentInfoDisplay from "@/components/StudentInfoDisplay.vue";
import SinglePrompt from "@/components/SinglePrompt.vue";
import StudentEditDialog from "@/components/StudentEditDialog.vue";
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
const tableMultipleSelection = ref(false);
watch(tableMultipleSelection, () => {
	if (tableMultipleSelection.value == false && selectedIds.value.length > 0) {
		selectedIds.value = selectedIds.value.slice(0, 1);
	}
});
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

const studentEditDialogVisible = ref(false);

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
		.finally(closeNewStudentDialog);
};

const getStudentByIDLocal = (studentID: string) => {
	if (!studentID) {
		message.error("Student ID cannot be empty");
		return;
	}
	getStudentByID(studentID, sessionSocket, sessionCredential)
		.then(({ name }) => {
			if (!name) {
				message.error(`No such student with ID: "${studentID}"`);
				return;
			}
			dialog.success({
				title: 'Search result',
				content: `Student with ID "${studentID}" is called "${name}"`,
				positiveText: 'Confirm',
			});
		})
		.catch(() => {

			message.error(`API call failed on getStudentByID`);
		})
		.finally(() => closeIDSearchDialog());
};

const columns = computed<DataTableColumns<StudentType>>(() => [
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
		title: 'Name',
		key: 'name',
		maxWidth: 300,
		minWidth: 200,
		fixed: 'left',
	},
]);

const notAvailableLabel = (label: string, source: Ref<boolean>, not: boolean = false) => computed(() => (not ? !source.value : source.value) ? `${label} (Not Available in Multiple Selection)` : label);
const toolBarItems: Array<{ title: string, icon: Component, onClick: () => void, critical: boolean, disabled?: boolean }> = [
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
					message.error(String(error));
				});
		},
		critical: true,
	},
	{
		title: "Add",
		icon: PersonAddAlt1Round,
		onClick: openNewStudentDialog,
		critical: false,
	},
	{
		title: "Search ID",
		icon: SearchRound,
		onClick: openIDSearchDialog,
		critical: false,
	},
	{
		title: notAvailableLabel("Edit", tableMultipleSelection).value,
		icon: EditNoteRound,
		onClick: () => {
			if (selectedIds.value.length !== 1) {
				message.error("Please select one student only");
				return;
			}
			studentEditDialogVisible.value = true;
		},
		critical: false,
		disabled: tableMultipleSelection.value,
	},
];

onMounted(() => {
	useLoadingBar().finish();
});
</script>

<template>
	<div class="outer-container">


		<!-- Search Result -->
		<n-split direction="horizontal" style="height: 100%; width: 100%; overflow: visible;">
			<template #1>
				<n-data-table v-model:checked-row-keys="selectedIds" :columns="columns" :data="searchResult"
					class="search-result" :row-key="row => row.id" :loading="loading" virtual-scroll flex-height />
			</template>

			<template #resize-trigger>
				<div class="resize-trigger-horizontal resize-trigger"></div>
			</template>

			<template #2>
				<div class="right-container">
					<!-- Search Bar -->
					<n-input type="text" v-model:value="searchName" placeholder="Search Name" class="search-bar" />

					<!-- Tool Bar -->
					<n-card content-style="padding: 8px;" class="tool-bar">
						<n-flex justify="left" :align="'center'" style="height: 2em;">
							<!-- Tool Bar Items -->
							<n-tooltip v-for="item in toolBarItems" :key="item.title" trigger="hover"
								placement="bottom">
								<template #trigger>
									<n-button strong secondary style="height: 2em; width: 2em;" @click="item.onClick"
										:type="(item.critical ? 'error' : 'primary')">
										<template #icon>
											<n-icon>
												<component :is="item.icon" />
											</n-icon>
										</template>
									</n-button>
								</template>
								<span>{{ item.title }}</span>
							</n-tooltip>
							<n-tooltip trigger="hover" placement="bottom">
								<template #trigger>
									<n-switch v-model:value="tableMultipleSelection" />
								</template>
								<span>Multiple Selection</span>
							</n-tooltip>
						</n-flex>
					</n-card>
					<n-card style="height: 100%; width: 100; min-width: 0; min-height: 0;" size="small">
						<div v-if="selectedIds.length === 0" style="display: grid; height: 100%;">
							<n-empty description="Please select a student" />
						</div>
						<!-- Selected Student -->
						<student-info-display v-else
							:student="searchResult.find(student => student.id === selectedIds[0])!" />
					</n-card>
				</div>
			</template>
		</n-split>
		<!-- Data -->


		<!-- Dialog -->
		<student-info-input v-model:visible="newStudentDialogVisible" @confirm="addStudentsLocal" />
		<single-prompt v-model:visible="studentIDSearchDialogVisible" title="Search by ID"
			prompt="Please input the student ID" @confirmed="getStudentByIDLocal" />
		<student-edit-dialog v-model:visible="studentEditDialogVisible" :studentId="selectedIds[0]" @confirmed="updateSearchResult" />
	</div>
</template>

<style scoped>
.outer-container {
	width: 100%;
	height: 100%;

	animation: fade-in 0.3s ease-in;
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
	width: 100%;
	height: 100%;
	min-width: 0;
	min-height: 0;

	padding: 4px;
}

.right-container {
	width: 100%;
	height: 100%;

	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: 34px 46px 1fr;
	gap: 8px;

	padding: 4px;
}

.resize-trigger {
	background-color: transparent;
	transition: all 0.2s;
	border-radius: 2px;
	box-shadow: none;
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
</style>
