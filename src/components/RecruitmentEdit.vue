<script setup lang="ts">
import StudentSelector from './StudentSelector.vue';
import { NForm, NFormItem, NInput, NDatePicker, NInputNumber, NEmpty, NFlex } from 'naive-ui';
import type { RecruitmentDataType } from '@/utils/server-apis';

const recruitment = defineModel<RecruitmentDataType>("recruitment");
const participants = defineModel<string[]>("participants");
</script>

<template>
<div class="outer-container">
	<n-form label-placement="top" v-if="!!recruitment" class="form">
		<div class="recruitment-input">
			<n-flex :wrap="false" style="width: 100%;">
				<n-form-item label="Department" path="department">
					<n-input v-model:value="recruitment.department" placeholder="Department" />
				</n-form-item>
				<n-form-item label="Form Filled By" path="formFilledBy">
					<n-input v-model:value="recruitment.formFilledBy" placeholder="Form Filled By" />
				</n-form-item>
			</n-flex>
			<n-form-item label="Event Name" path="eventName">
				<n-input v-model:value="recruitment.eventName" placeholder="Event Name" />
			</n-form-item>
			<n-flex :wrap="false" style="width: 100%;">
				<n-form-item label="Event Time" path="eventTime">
					<n-date-picker v-model:value="recruitment.eventTime" type="datetime" />
				</n-form-item>
				<n-form-item label="Volunteer Hours" path="volunteerHours">
					<n-input-number v-model:value="recruitment.volunteerHours" placeholder="Volunteer Hours" />
				</n-form-item>
			</n-flex>
			<n-form-item label="Additional Notes" path="additionalNotes">
				<n-input v-model:value="recruitment.additionalNotes" placeholder="Additional Notes" type="textarea"/>
			</n-form-item>
			</div>
			<div class="student-selector">
				<n-form-item label="Participants" path="participants" style="height: 100%;">
				<student-selector class="student-selector" v-model:value="participants" style="height: 100%;"/>
				</n-form-item>
			</div>
		</n-form>
		<n-empty v-else description="No Data" />
</div>
</template>

<style scoped>
.outer-container {
	width: 100%;
	height: 100%;
}

.form {
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr;
	align-content: stretch;
	align-items: stretch;
	gap: 16px;
}

.recruitment-input {
	grid-column: 1 / 2;
	grid-row: 1 / 2;

	min-width: 0;
	min-height: 0;
}

.student-selector {
	grid-column: 2 / 3;
	grid-row: 1 / 2;

	min-width: 0;
	min-height: 0;
}
</style>
