<script setup lang="ts">
import { type DataTableColumns, NDataTable, NEmpty } from 'naive-ui';
import { getAllRecruitmentInfo, getRecruitmentByID, type RecruitmentDataType } from '@/utils/server-apis';
import { onMounted, ref, watch } from 'vue';
import { useSessionSocket } from '@/stores/session-socket';
import { useSessionCredentialStore } from '@/stores/session-credential';
import RecruitmentInfoDisplay from './RecruitmentInfoDisplay.vue';

const sessionSocket = await useSessionSocket();
const sessionCredential = await useSessionCredentialStore();

interface RowData {
	id: string,
	name: string,
}

const allInfo = ref<RowData[]>([]);
const selectedIDs = defineModel<string[]>("value", { default: [] });
const selectedRecruitment = ref<RecruitmentDataType | null>(null);

const columns = ref([
	{
		type: 'selection',
	},
	{
		title: 'Name',
		key: 'name',
	},
]);

onMounted(async () => {
	allInfo.value = (await getAllRecruitmentInfo(sessionSocket, sessionCredential)).map((info) => ({ name: info.eventName, id: info.id }));
});

watch(selectedIDs, async () => {
	if (selectedIDs.value.length > 0) {
		selectedRecruitment.value = await getRecruitmentByID(selectedIDs.value[selectedIDs.value.length - 1], sessionSocket, sessionCredential);
	}
});
</script>

<template>
	<div class="selector-container">
		<div class="table">
			<n-data-table :columns="(columns as DataTableColumns)" v-model:checked-row-keys="selectedIDs" :data="allInfo" flex-height
				style="height: 100%;" :row-key="row => row.id"/>
		</div>
		<div class="selector">
			<recruitment-info-display v-if="selectedIDs.length > 0 && selectedRecruitment" :recruitment="selectedRecruitment" />
			<div v-else style="height: 100%; width: 100%; display: grid; place-content: center">
				<n-empty  description="Select a recruitment to start" />
			</div>
		</div>
	</div>
</template>

<style scoped>
.selector-container {
	width: 100%;
	height: 100%;

	min-height: 8em;


	display: grid;
	gap: 8px;

	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr;
}

.table {
	min-width: 24em;
	grid-column: 1 / 2;
	grid-row: 1 / 2;
}

.selector {
	min-width: 24em;
	grid-column: 2 / 3;
	grid-row: 1 / 2;
}
</style>
