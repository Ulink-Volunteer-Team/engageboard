<script setup lang="ts">
import { ref } from 'vue';
import { NModal, NInput, NFlex, NButton, NP } from 'naive-ui';

const props = defineProps({
	title: String,
	prompt: String,
	placeholder: String
});

const visible = defineModel<boolean>("visible");
const emit = defineEmits(['confirmed', 'close-dialog', "update:dialog-visible"]);

const input = ref("");

const handleConfirm = () => {
	emit('confirmed', input.value);
	input.value = "";
};

const handleCancel = () => {
	emit('close-dialog');
	emit('update:dialog-visible', false);
	input.value = "";
};

</script>

<template>
	<n-modal v-model:show="visible" preset="dialog" :width="520" @close="handleCancel" :title="props.title">
			<n-flex vertical>
				<n-p>{{ props.prompt }}</n-p>
				<n-input v-model:value="input" :placeholder=props.placeholder />
			</n-flex>
			<template #action>
				<n-button type="primary" @click="handleConfirm">Confirm</n-button>
			</template>
		</n-modal>
</template>

