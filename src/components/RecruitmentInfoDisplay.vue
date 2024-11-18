<script setup lang="ts">
import { NThing, NTable, NTr, NTd, NTbody, NThead } from 'naive-ui';
import type { RecruitmentDataType } from '@/utils/server-apis';

const props = defineProps<{
	recruitment: RecruitmentDataType;
}>();
</script>

<template>
	<n-thing>
		<template #header>{{ props.recruitment.eventName }}</template>
		<template #header-extra><pre>{{ new Date(props.recruitment.eventTime).toLocaleString() }}</pre></template>

		<n-table>
			<n-thead>
				<n-tr>
					<n-td>Department</n-td>
					<n-td>Form Filled By</n-td>
					<n-td>Volunteer Hours</n-td>
				</n-tr>
			</n-thead>
			<n-tbody>
				<n-tr>
					<n-td>{{ props.recruitment.department }}</n-td>
					<n-td>{{ props.recruitment.formFilledBy }}</n-td>
					<n-td><pre>{{ props.recruitment.volunteerHours }}</pre></n-td>
				</n-tr>
			</n-tbody>
		</n-table>
		<template #description><label>ID: <pre style="display: inline">{{ props.recruitment.id }}</pre></label></template>
		<template #footer>
			<div style="height: 100%; width: 100%; overflow: auto">
				{{ props.recruitment.additionalNotes }}
			</div>
		</template>
	</n-thing>
</template>
