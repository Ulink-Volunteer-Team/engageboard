<script setup lang="ts">
import RecruitmentSelector from './RecruitmentSelector.vue';
import { NForm, NFormItem, NInput, NEmpty, NFlex } from 'naive-ui';
import type { StudentType } from '@/utils/server-apis';

const student = defineModel<StudentType>("student");
const recruitments = defineModel<string[]>("recruitments");
</script>

<template>
	<div class="outer-container">
		<n-form label-placement="top" v-if="!!student" class="form">
			<div class="student-input">
				<n-flex :wrap="false" style="width: 100%;">
					<n-form-item label="ID" path="id" style="width: 100%;">
						<n-input v-model:value="student.id" placeholder="ID" disabled />
					</n-form-item>
					<n-form-item label="Name" path="name" style="width: 100%;">
						<n-input v-model:value="student.name" placeholder="Name" />
					</n-form-item>
				</n-flex>
			</div>
			<div class="recruitment-selector">
				<n-form-item label="Recruitments" path="participants" style="height: 100%;">
					<recruitment-selector class="student-selector" v-model:value="recruitments" style="height: 100%;" />
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
	grid-template-columns: 1fr;
	grid-template-rows: 5em 1fr;
	align-content: stretch;
	align-items: stretch;
	gap: 16px;

	height: 100%;
	width: 100%;
}

.student-input {
	grid-column: 1 / 2;
	grid-row: 1 / 2;

	min-width: 0;
	min-height: 0;
}

.recruitment-selector {
	grid-column: 1 / 2;
	grid-row: 2 / 3;

	min-width: 0;
	min-height: 0;
}
</style>
