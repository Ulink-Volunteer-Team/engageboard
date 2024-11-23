<script setup lang="ts">
import RecruitmentEdit from './RecruitmentEdit.vue';
import { NModal, NButton } from 'naive-ui';
import { getRecruitmentByID, getVolunteersIDsByRecruitmentIDs, updateRecruitments, updateStudentsOfAnEvent } from '@/utils/server-apis';
import { watch, ref } from 'vue';
import { useSessionSocket } from '@/stores/session-socket';
import { useSessionCredentialStore } from '@/stores/session-credential';
import { useMessage } from 'naive-ui';
import type { RecruitmentDataType } from "@/utils/server-apis";

const props = defineProps<{
	recruitmentID?: string
}>();

const visible = defineModel<boolean>("visible");

const message = useMessage();

const participantsRef = ref<string[]>([]);
const recruitmentRef = ref<RecruitmentDataType>();

watch(props, async () => {
	if (!props.recruitmentID) return;

	const sessionSocket = await useSessionSocket();
	const sessionCredential = await useSessionCredentialStore();
	getRecruitmentByID(props.recruitmentID, sessionSocket, sessionCredential).then((recruitment) => {
		if (!recruitment) {
			message.error("Recruitment Not Found");
		}
		else {
			getVolunteersIDsByRecruitmentIDs([recruitment.id!], sessionSocket, sessionCredential).then((result) => {
				const participants = result.find(id => id[0] === recruitment.id)?.[1] || [];

				participantsRef.value = participants;
				recruitmentRef.value = recruitment;
			})
			.catch((error) => {
				message.error("Fail to load volunteer data");
				console.error(error);
			})
		}
	})
	.catch((error) => {
		message.error("Fail to load recruitment");
		console.error(error);
	})
}, {deep: true});

const handleConfirm = async () => {
	const sessionSocket = await useSessionSocket();
	const sessionCredential = await useSessionCredentialStore();

	console.log(participantsRef.value, recruitmentRef.value);
	await updateStudentsOfAnEvent(recruitmentRef.value!.id!, participantsRef.value, sessionSocket, sessionCredential);
	try{

		await updateRecruitments([recruitmentRef.value!], sessionSocket, sessionCredential);
		visible.value = false;
	}
	catch(error) {
		message.error("Errors occurred when trying to update recruitment: "+ String(error));
		console.error(error);
	}
}
</script>

<template>
	<n-modal v-model:show="visible" preset="card" title="Edit Recruitment" class="model" content-style="width: 100%;" style="width: 60em">
		<recruitment-edit v-model:recruitment="recruitmentRef" v-model:participants="participantsRef" />
		<template #action>
			<n-button type="primary" @click="handleConfirm">Save</n-button>
		</template>
	</n-modal>
</template>
