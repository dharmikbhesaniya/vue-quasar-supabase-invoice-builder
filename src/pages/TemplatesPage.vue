<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Template Management</div>

    <!-- <div class="row q-gutter-md">
      <div class="col-12 col-md-8"> -->
    <TemplateSelector />
    <!-- </div>
    </div> -->
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
