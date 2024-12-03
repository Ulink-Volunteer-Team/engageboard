<script setup lang="ts">
import { NModal, NButton, NSpin } from 'naive-ui';
import { useSessionSocket } from '@/stores/session-socket';
import { useSessionCredentialStore } from '@/stores/session-credential';
import {type StudentType, getStudentsByIDs, getRecruitmentIDsByVolunteerIDs, updateRecordsOfAStudent, updateStudents } from '@/utils/server-apis';
import StudentEdit from './StudentEdit.vue';
import { ref, watch } from "vue";

const visible = defineModel<boolean>("visible");
const emits = defineEmits(['confirmed']);
const props = defineProps<{ studentId?: string }>();

const student = ref<StudentType>();
const recruitments = ref<string[]>([]);

const sessionSocket = await useSessionSocket();
const sessionCredential = await useSessionCredentialStore();

const showSpin = ref(false);

const handleConfirm = async () => {
	showSpin.value = true;
	try {
		await updateRecordsOfAStudent(student.value!.id, recruitments.value, sessionSocket, sessionCredential);
		await updateStudents([student.value!], sessionSocket, sessionCredential);
	}
	catch(error) {
		console.error(error);
	}
	finally {
		visible.value = false;
		showSpin.value = false;
		emits('confirmed');
	}
};

watch(props, async () => {
	if(!props.studentId) return;
	showSpin.value = true;
	student.value = (await getStudentsByIDs([props.studentId], sessionSocket, sessionCredential))[0];
	recruitments.value = (await getRecruitmentIDsByVolunteerIDs([props.studentId], sessionSocket, sessionCredential)).find(x => x[0] === props.studentId)![1];
	showSpin.value = false;
});
</script>

<template>
	<n-modal preset="dialog" v-model:show="visible" title="Edit Student" content-style="width: 100%; height: 30em;" style="width: 60em;">
		<n-spin :show="showSpin" style="height: 100%; width: 100%;" content-style="height: 100%; width: 100%;">
			<student-edit v-model:student="student" v-model:recruitments="recruitments" style="height: 100%;"/>
		</n-spin>
		<template #action>
			<n-button type="primary" @click="handleConfirm">Save</n-button>
		</template>
	</n-modal>
</template>

<style scoped>

</style>
