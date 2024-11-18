<script setup lang="ts">
import { ref } from 'vue';
import { NModal, NInput, NFlex, NButton } from 'naive-ui';
import type { StudentType } from '@/utils/server-apis';

const emit = defineEmits(["confirm"]);
const visible = defineModel<boolean>("visible");

const student = ref<StudentType>({ id: '', name: '' });

const handleConfirm = () => {
	emit('confirm', student.value);
	student.value = { id: '', name: '' };
};
</script>

<template>
	<n-modal v-model:show="visible" preset="dialog" title="Add new student" :width="520">
		<n-flex vertical>
			<n-input v-model:value="student.id" placeholder="Student ID" />
			<n-input v-model:value="student.name" placeholder="Student Name" />
		</n-flex>
		<template #action>
			<n-button type="primary" @click="handleConfirm">Add</n-button>
		</template>
	</n-modal>
</template>
