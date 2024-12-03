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
		width: 120,
		ellipsis: {
			tooltip: true,
		},
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
		<n-tabs type="segment" animated class="tab" default-value="info" pane-style="height: 100%;"
			style="height: 100%;" pane-wrapper-style="height: 100%;">
			<n-tab-pane name="info" tab="Info">
				<div class="info-container">
					<n-thing style="grid-area: 1 / 1 / 2 / 2;">
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
								<pre class="selective-text">{{ props.recruitment.id }}</pre>
							</label></template>
					</n-thing>
					<div class="description selective-text">
						{{ props.recruitment.additionalNotes }}
					</div>
				</div>
			</n-tab-pane>
			<n-tab-pane name="participants" tab="Participants">
				<div style="height: 100%;">
					<n-data-table :columns="columns" :data="participants" style="height: 100%; min-height: 12em;"
						flex-height :row-key="row => row.id" :loading="loading" />
				</div>
			</n-tab-pane>
		</n-tabs>
	</div>
</template>

<style scoped>
.outer-container {
	position: relative;

	height: 100%;
	width: 100%;

	overflow: auto;
}

.tab {
	height: 100%;
	width: 100%;
}

.info-container {
	height: calc(100% - 1em);
	width: 100%;
	overflow: auto;

	display: grid;
	grid-template-rows: auto auto;

	position: absolute;
}

.description {
	height: 100%;
	width: 100%;
	overflow: auto;
	min-height: 4em;



	margin-top: 8px;
	grid-area: 2 / 1 / 3 / 2;
}
</style>
