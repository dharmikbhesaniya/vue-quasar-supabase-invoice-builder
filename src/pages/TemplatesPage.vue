<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Template Management</div>

    <TemplateSelector />
  </q-page>
</template>

<script setup lang="ts">
import TemplateSelector from "src/components/template/TemplateSelector.vue";
import { onMounted } from "vue";
import { useTemplateStore } from "../stores/template";

const templateStore = useTemplateStore();

onMounted(() => {
  templateStore.loadTemplates();
});
</script>
