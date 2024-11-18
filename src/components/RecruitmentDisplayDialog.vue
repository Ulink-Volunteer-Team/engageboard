<script setup lang="ts">
import { defineProps } from 'vue';
import { type RecruitmentDataType } from '@/utils/server-apis';
import RecruitmentInfoDisplay from './RecruitmentInfoDisplay.vue';
import { NEmpty, NModal, NButton } from 'naive-ui';

const props = defineProps<{
	recruitment: RecruitmentDataType | undefined | null;
}>();

const visible = defineModel<boolean>("visible");
</script>


<template>
	<n-modal v-model:show="visible" preset="dialog" title="Recruitment Details">
		<n-empty v-if="!props.recruitment" description="No Data" />
		<RecruitmentInfoDisplay :recruitment="props.recruitment" v-else/>
		<template #action>
			<n-button type="primary" @click="visible = false">Confirm</n-button>
		</template>
	</n-modal>
</template>
