<template>
  <q-card>
    <q-card-section>
      <div class="row q-gutter-sm">
        <TemplateCard
          v-for="template in templates"
          :key="template.id"
          :template="template"
          :selected="selectedTemplate?.id === template.id"
          @select="selectTemplate"
          @preview="previewTemplateHandler"
          @download="downloadTemplate"
          @delete="confirmDeleteTemplate"
        />
      </div>
    </q-card-section>

    <TemplateUploader
      v-model="showUploadDialog"
      @uploaded="onTemplateUploaded"
    />

    <PreviewDialog
      v-model="showPreviewDialog"
      :previewTemplate="previewTemplate"
      @close="closePreview"
      @use="useCurrentTemplate"
      @download="downloadCurrentTemplate"
    >
      <!-- Content slots for code and visual preview go here -->
    </PreviewDialog>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useTemplateStore } from "src/stores/template";
import { InvoiceTemplate } from "src/types/invoice";
import TemplateUploader from "src/components/template/TemplateUploader.vue";
import PreviewDialog from "../PreviewDialog.vue";
import TemplateCard from "./TemplateCard.vue";

const $q = useQuasar();
const templateStore = useTemplateStore();

const showUploadDialog = ref(false);
const showPreviewDialog = ref(false);
const previewTemplate = ref<InvoiceTemplate | null>(null);
const templateContent = ref<string>("");
const loadingPreview = ref(false);

const templates = computed(() => templateStore.templates);
const selectedTemplate = computed(() => templateStore.selectedTemplate);

const selectTemplate = (template: InvoiceTemplate) => {
  templateStore.selectTemplate(template);
  // $q.notify({
  //   type: "positive",
  //   message: `Template "${template.name}" selected`,
  // });
};

const previewTemplateHandler = async (template: InvoiceTemplate) => {
  try {
    loadingPreview.value = true;
    previewTemplate.value = template;

    // Fetch template content from Supabase Storage
    const response = await fetch(template.preview_url || template.file_path);
    if (!response.ok) {
      throw new Error("Failed to fetch template content");
    }

    templateContent.value = await response.text();
    showPreviewDialog.value = true;
  } catch (error) {
    console.error("Error loading template for preview:", error);
    // $q.notify({
    //   type: "negative",
    //   message: "Failed to load template for preview",
    // });
  } finally {
    loadingPreview.value = false;
  }
};

const downloadTemplate = (template: InvoiceTemplate) => {
  window.open(template.preview_url || template.file_path, "_blank");
};

const downloadCurrentTemplate = () => {
  if (previewTemplate.value) {
    downloadTemplate(previewTemplate.value);
  }
};

const useCurrentTemplate = () => {
  if (previewTemplate.value) {
    selectTemplate(previewTemplate.value);
    closePreview();
  }
};

const closePreview = () => {
  showPreviewDialog.value = false;
  previewTemplate.value = null;
  templateContent.value = "";
};

const confirmDeleteTemplate = (template: InvoiceTemplate) => {
  // $q.dialog({
  //   title: "Delete Template",
  //   message: `Are you sure you want to delete "${template.name}"? This action cannot be undone.`,
  //   cancel: true,
  //   persistent: true,
  //   color: "negative",
  // }).onOk(async () => {
  //   try {
  //     await templateStore.deleteTemplate(template.id);
  //     $q.notify({
  //       type: "positive",
  //       message: "Template deleted successfully",
  //     });
  //   } catch (error) {
  //     $q.notify({
  //       type: "negative",
  //       message: "Error deleting template",
  //     });
  //   }
  // });
};

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

<style scoped>
.template-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.template-card.selected {
  border-color: var(--q-primary);
  background-color: rgba(25, 118, 210, 0.05);
}

.preview-dialog {
  height: 100vh;
}

.code-container {
  background: #1e1e1e;
  border-radius: 8px;
  padding: 16px;
  overflow: auto;
  max-height: calc(100vh - 300px);
}

.code-container pre {
  margin: 0;
  color: #d4d4d4;
  font-family: "Courier New", monospace;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.preview-container {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 16px;
  background: white;
  overflow: auto;
  max-height: calc(100vh - 300px);
}

.html-preview {
  font-family: Arial, sans-serif;
  line-height: 1.6;
}

.vue-preview {
  text-align: center;
  padding: 20px;
}

.vue-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  color: #1976d2;
}

.vue-structure {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  text-align: left;
}

.error-preview {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
