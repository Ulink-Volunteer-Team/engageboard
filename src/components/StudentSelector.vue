<script setup lang="ts">
import { NTransfer } from 'naive-ui';
import { getAllStudentInfo } from '@/utils/server-apis';
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
	allInfo.value = (await getAllStudentInfo(await useSessionSocket(), await useSessionCredentialStore()))
		.map((info) => ({ label: info.name, value: info.id }));
})
</script>

<template>
<n-transfer v-model:value="selectedID" :options="allInfo"/>
</template>

