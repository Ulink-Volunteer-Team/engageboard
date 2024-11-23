<script setup lang="ts">
import { NTransfer } from 'naive-ui';
import { getAllStudents } from '@/utils/server-apis';
import { onMounted, ref } from 'vue';
import { useSessionSocket } from '@/stores/session-socket';
import { useSessionCredentialStore } from '@/stores/session-credential';

type DisplayInfo = {
	label: string,
	value: string
}

const allInfo = ref<DisplayInfo[]>([]);
const selectedID = defineModel<string[]>("value");

onMounted(async () => {
	allInfo.value = (await getAllStudents(await useSessionSocket(), await useSessionCredentialStore())).filter(info => info.id)
		.map((info) => ({ label: info.name, value: info.id }));
});
</script>

<template>
	<n-transfer v-model:value="selectedID" :options="allInfo" class="selector" source-filterable />
</template>
