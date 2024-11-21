<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { NThing, NTable, NTr, NTd, NTbody, NThead, NDataTable, useMessage } from 'naive-ui';
import type { RecruitmentDataType, StudentType } from '@/utils/server-apis';
import { getVolunteersIDsByRecruitmentIDs, getStudentsByIDs } from '@/utils/server-apis';
import { useSessionSocket } from '@/stores/session-socket';
import { useSessionCredentialStore } from '@/stores/session-credential';

const message = useMessage();
const columns = [
	{
		title: "ID",
		key: "id"
	},
	{
		title: "Name",
		key: "name"
	},
]

const participants = ref<StudentType[]>([]);
const loading = ref(false);

const props = defineProps<{
	recruitment: RecruitmentDataType;
}>();

const updateParticipants = async () => {
	const id = props.recruitment.id;
	if (!id) {
		participants.value = []
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
}

watch(props, async () => {
	updateParticipants();
}, { deep: true });

onMounted(async () => {
	updateParticipants();
})
</script>

<template>
	<div class="outer-container">
		<div class="thing">
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
						<pre style="display: inline">{{ props.recruitment.id }}</pre>
					</label></template>
				<template #footer>
					<div style="height: 100%; width: 100%; overflow: auto">
						{{ props.recruitment.additionalNotes }}
					</div>
				</template>
			</n-thing>
		</div>

		<div class="table">
			<n-data-table :columns="columns" :data="participants" virtual-scroll flex-height style="height: 100%;" :loading="loading"/>
		</div>
	</div>
</template>

<style scoped>
.outer-container {
	height: 100%;
	width: 100%;

	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: 1fr 1fr;
	gap: 8px;
}

.thing {
	height: 100%;
	width: 100%;

	min-width: 0;
	min-height: 0;

	grid-column: 1 / 2;
	grid-row: 1 / 2;
	overflow: scroll;
}

.table {
	height: 100%;
	width: 100%;

	min-width: 0;
	min-height: 0;

	grid-column: 1 / 2;
	grid-row: 2 / 3;
}
</style>
