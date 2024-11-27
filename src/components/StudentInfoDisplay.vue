<script setup lang="ts">
import { ref, watch } from 'vue';
import { NThing, NDataTable, useMessage, NH4 } from 'naive-ui';
import type { RecruitmentDataType, StudentType } from '@/utils/server-apis';
import { getRecruitmentIDsByVolunteerIDs, getRecruitmentsByIDs, calculateVolunteerHours } from '@/utils/server-apis';
import { useSessionSocket } from '@/stores/session-socket';
import { useSessionCredentialStore } from '@/stores/session-credential';

const message = useMessage();
const columns = [
	{
		title: "Recruitment ID",
		key: "id",
	},
	{
		title: "Recruitment Name",
		key: "eventName",
	},
	{
		title: "Volunteer Hours",
		key: "volunteerHours",
	},
];

const recruitments = ref<RecruitmentDataType[]>([]);
const volunteerHours = ref(-1);
const loading = ref(false);

const props = defineProps<{
	student: StudentType;
}>();

const updateRecruitments = async () => {
	const id = props.student.id;
	if (!id) {
		recruitments.value = [];
		return;
	}

	loading.value = true;

	try {
		const socket = await useSessionSocket();
		const credential = await useSessionCredentialStore();
		const recruitmentIDs = (await getRecruitmentIDsByVolunteerIDs([id], socket, credential)).find(x => x[0] === id)![1];
		volunteerHours.value = (await calculateVolunteerHours([id], socket, credential))[id];
		recruitments.value = (await getRecruitmentsByIDs(recruitmentIDs, socket, credential));
	}
	catch (e) {
		console.error(e);
		message.error(`Failed to load participants of recruitment "${props.student.name}" (ID: ${props.student.id})`);
	}
	finally {
		loading.value = false;
	}
};

watch(props, async () => {
	updateRecruitments();
}, { deep: true });

updateRecruitments();
</script>

<template>
	<div class="outer-container-student">
		<n-thing class="description">
			<template #header>{{ props.student.name }}</template>
			<template #header-extra>Volunteer Hours: <pre style="display: inline">{{ volunteerHours > -1 ? volunteerHours : 'N/A' }}</pre> </template>
			<template #description>
				<label>
					ID:
					<pre
						style="display: inline; user-select: text; cursor: text; padding: 8px;">{{ props.student.id }}</pre>
				</label>
			</template>
		</n-thing>
		<div class="table">
			<n-h4>Participated Events (Recruitments)</n-h4>
			<n-data-table :columns="columns" :data="recruitments" style="height: calc(100% - 3.5em); min-height: 6em;" flex-height
				:row-key="row => row.id" :loading="loading"/>
		</div>
	</div>
</template>

<style scoped>
.outer-container-student {
	height: 100%;
	width: 100%;

	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: auto 1fr;
	gap: 16px;

	overflow: auto;
}

.description {
	grid-column: 1 / 2;
	grid-row: 1 / 2;

	min-height: 0;
	min-width: 0;
}

.table {
	grid-column: 1 / 2;
	grid-row: 2 / 3;

	min-height: 0;
	min-width: 0;
}
</style>
