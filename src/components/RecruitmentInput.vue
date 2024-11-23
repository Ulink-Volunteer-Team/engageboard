<script setup lang="ts">
import { NModal, NInput, NFlex, NButton, NDatePicker, NInputNumber, NForm, NFormItem } from 'naive-ui';
import { type RecruitmentDataType } from '@/utils/server-apis';

const emit = defineEmits(["confirm"]);

const visible = defineModel<boolean>("visible");

const getInitialData = () => JSON.parse(JSON.stringify({
	department: '',
	formFilledBy: '',
	eventName: '',
	eventTime: Date.now(),
	volunteerHours: 0,
	additionalNotes: '',
})) as RecruitmentDataType;

const recruitment = defineModel<RecruitmentDataType>("recruitment", {default: {
	department: '',
	formFilledBy: '',
	eventName: '',
	eventTime: Date.now(),
	volunteerHours: 0,
	additionalNotes: '',
}});

const handleConfirm = () => {
	emit('confirm', recruitment.value);
	recruitment.value = getInitialData();
};
</script>

<template>
	<n-modal v-model:show="visible" preset="dialog" title="Add new recruitment">
		<n-form label-placement="top">
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
		</n-form>
		<template #action>
			<n-button type="primary" @click="handleConfirm">Add</n-button>
		</template>
	</n-modal>
</template>
