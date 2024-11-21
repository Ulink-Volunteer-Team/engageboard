<script setup lang="ts">
import { NModal, NButton } from 'naive-ui';
import StudentSelector from './StudentSelector.vue';

const visible = defineModel<boolean>("visible");
const value = defineModel<string[]>("value");
</script>

<template>
	<n-modal v-model:show="visible" preset="dialog" title="Select some students">
		<StudentSelector v-model:value="value" />

		<template #action>
			<n-button type="primary" @click="visible = false">Confirm</n-button>
		</template>
	</n-modal>
</template>
