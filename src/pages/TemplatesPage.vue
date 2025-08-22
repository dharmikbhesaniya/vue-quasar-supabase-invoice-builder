<template>
  <q-page class="q-pa-md">
    <CustomHeader
      title="Invoice Templates"
      subtitle="Manage your invoice templates"
      button-label="UPLOAD TEMPLATE"
      button-icon="add_circle"
      :on-button-click="() => (showUploadDialog = true)"
    >
      <div>
        <span>Total Templates:</span>
        <span class="text-bold q-ml-sm">{{ templates.length }}</span>
      </div>
    </CustomHeader>

    <TemplateSelector />

    <TemplateUploader
      v-model="showUploadDialog"
      @uploaded="onTemplateUploaded"
    />
  </q-page>
</template>

<script setup lang="ts">
import TemplateSelector from "src/components/template/TemplateSelector.vue";
import { computed, onMounted, ref } from "vue";
import { useTemplateStore } from "../stores/template";
import CustomHeader from "src/components/ui/CustomHeader.vue";
import TemplateUploader from "src/components/template/TemplateUploader.vue";

const templateStore = useTemplateStore();

const showUploadDialog = ref(false);

const templates = computed(() => templateStore.templates);

const onTemplateUploaded = () => {
  // $q.notify({
  //   type: "positive",
  //   message: "Template uploaded successfully!",
  // });
};

onMounted(() => {
  templateStore.loadTemplates();
});
</script>
