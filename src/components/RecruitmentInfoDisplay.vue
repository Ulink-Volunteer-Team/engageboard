<script setup lang="ts">
import { ref, watch } from 'vue';
import { NThing, NTable, NTr, NTd, NTbody, NThead, NDataTable, useMessage, NTabs, NTabPane } from 'naive-ui';
import type { RecruitmentDataType, StudentType } from '@/utils/server-apis';
import { getVolunteersIDsByRecruitmentIDs, getStudentsByIDs } from '@/utils/server-apis';
import { useSessionSocket } from '@/stores/session-socket';
import { useSessionCredentialStore } from '@/stores/session-credential';

const message = useMessage();
const columns = [
	{
		title: "Student ID",
		key: "id",
	},
	{
		title: "Student Name",
		key: "name",
	},
];

const participants = ref<StudentType[]>([]);
const loading = ref(false);

const props = defineProps<{
	recruitment: RecruitmentDataType;
}>();

const updateParticipants = async () => {
	const id = props.recruitment.id;
	if (!id) {
		participants.value = [];
		return;
	}

	loading.value = true;

	try {
		const socket = await useSessionSocket();
		const credential = await useSessionCredentialStore();
		const participantIDs = (await getVolunteersIDsByRecruitmentIDs([id], socket, credential)).find(x => x[0] === id)![1];
		participants.value = (await getStudentsByIDs(participantIDs, socket, credential));
	}
	catch (e) {
		console.error(e);
		message.error(`Failed to load participants of recruitment "${props.recruitment.eventName}" (ID: ${props.recruitment.id})`);
	}
	finally {
		loading.value = false;
	}
};

watch(props, async () => {
	updateParticipants();
}, { deep: true });

updateParticipants();
</script>

<template>
	<div class="outer-container">
		<n-tabs type="segment" animated class="tab" default-value="info" pane-style="overflow: auto; height: 100%;" style="height: 100%;" pane-wrapper-style="height: 100%;">
			<n-tab-pane name="info" tab="Info">
				<n-thing>
					<template #header>{{ props.recruitment.eventName }}</template>
					<template #header-extra>
						<pre>{{ new Date(props.recruitment.eventTime).toLocaleString() }}</pre>
					</template>

					<n-table>
						<n-thead>
							<n-tr>
								<n-td>Department</n-td>
								<n-td>Form Filled By</n-td>
								<n-td>Volunteer Hours</n-td>
							</n-tr>
						</n-thead>
						<n-tbody>
							<n-tr>
								<n-td>{{ props.recruitment.department }} 1</n-td>
								<n-td>{{ props.recruitment.formFilledBy }}</n-td>
								<n-td>
									<pre>{{ props.recruitment.volunteerHours }}</pre>
								</n-td>
							</n-tr>
						</n-tbody>
					</n-table>

					<template #description><label>ID:
							<pre style="display: inline; user-select: text;">{{ props.recruitment.id }}</pre>
						</label></template>
					<template #footer>
						<div style="height: 100%; width: 100%; overflow: auto; max-height: 12em;">
							{{ props.recruitment.additionalNotes }}
						</div>
					</template>
				</n-thing>
			</n-tab-pane>
			<n-tab-pane name="participants" tab="Participants">
				<div style="height: 100%;">

				<n-data-table :columns="columns" :data="participants" style="height: 100%; min-height: 12em;" flex-height :row-key="row => row.id"
					:loading="loading" />
				</div>
			</n-tab-pane>
		</n-tabs>
	</div>
</template>

<style scoped>
.outer-container {
	height: 100%;
	width: 100%;
}

.tab {
	height: 100%;
	width: 100%;
}
</style>
