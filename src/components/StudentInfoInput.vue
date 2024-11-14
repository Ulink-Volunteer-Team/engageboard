<script setup lang="ts">
import { ref, defineProps, watch } from 'vue';
import { NModal, NInput, NFlex, NButton } from 'naive-ui';

const props = defineProps({
	dialogVisible: Boolean,
});
const emit = defineEmits(['student-info-confirmed', 'close-dialog', "update:dialog-visible"]);

const student = ref({ id: '', name: '' });
const dialogVisibleLocal = ref(false);

watch(props, (newVal) => {
	dialogVisibleLocal.value = newVal.dialogVisible;
}, {deep: true});

const handleConfirm = () => {
	emit('student-info-confirmed', student.value);
	student.value = { id: '', name: '' };
};

const handleCancel = () => {
	emit('close-dialog');
	emit('update:dialog-visible', false);

	student.value = { id: '', name: '' };
};

</script>

<template>
	<n-modal v-model:show="dialogVisibleLocal" preset="dialog" title="Add new student" :width="520" @close="handleCancel">
			<n-flex vertical>
				<n-input v-model:value="student.id" placeholder="Student ID" />
				<n-input v-model:value="student.name" placeholder="Student Name" />
			</n-flex>
			<template #action>
				<n-button type="primary" @click="handleConfirm">Add</n-button>
			</template>
		</n-modal>
</template>

