<template>
  <q-dialog v-model="dialogModel" persistent>
    <q-card style="min-width: 500px; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-card-section>
        <q-form ref="formRef">
          <!-- Template Name -->
          <q-input
            v-model="templateName"
            label="Template Name"
            outlined
            dense
            class="q-mb-md"
            :rules="[(val) => !!val || 'Template name is required']"
          />

          <!-- File Upload -->
          <q-file
            v-model="selectedFile"
            label="Select Template File"
            outlined
            dense
            accept=".html,.vue"
            max-file-size="5242880"
            use-chips
            @rejected="onRejected"
            :disable="uploading"
            class="q-mb-sm"
          >
            <template #prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <div class="text-caption text-grey-6">
            Supported: <strong>.html</strong>, <strong>.vue</strong> files (Max:
            5MB)
          </div>

          <!-- Upload Progress -->
          <div v-if="uploading" class="q-mt-md">
            <div class="text-caption">Uploading...</div>
            <q-linear-progress :value="uploadProgress / 100" color="primary" />
          </div>

          <!-- File Preview -->
          <div v-if="previewContent" class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">Preview:</div>
            <div class="template-preview q-pa-sm" v-html="previewContent" />
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancel" :disable="uploading" @click="closeDialog" />
        <q-btn
          color="primary"
          label="Upload"
          :loading="uploading"
          :disable="!canUpload"
          @click="uploadTemplate"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useQuasar } from "quasar";
import { useTemplateUpload } from "src/composables/useTemplateUpload";

interface Props {
  modelValue: boolean;
  title?: string;
}
interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "uploaded"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const $q = useQuasar();
const formRef = ref();
const templateName = ref("");
const selectedFile = ref<File | null>(null);
const previewContent = ref("");

const dialogModel = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const {
  uploading,
  uploadProgress,
  uploadTemplate: uploadTemplateComposable,
} = useTemplateUpload();

const canUpload = computed(() => {
  return (
    !!templateName.value.trim() && !!selectedFile.value && !uploading.value
  );
});

const uploadTemplate = async () => {
  const valid = await formRef.value?.validate?.();
  if (!valid || !canUpload.value) return;

  try {
    await uploadTemplateComposable(selectedFile.value!, templateName.value);

    // $q.notify({
    //   type: "positive",
    //   message: "Template uploaded successfully!",
    // });
    emit("uploaded");
    closeDialog();
  } catch (error) {
    // $q.notify({
    //   type: "negative",
    //   message: error instanceof Error ? error.message : "Upload failed",
    // });
  }
};

const closeDialog = () => {
  templateName.value = "";
  selectedFile.value = null;
  previewContent.value = "";
  emit("update:modelValue", false);
};

const onRejected = (rejected: any[]) => {
  const rejection = rejected[0];
  const reason = rejection?.failedPropValidation;

  if (reason === "max-file-size") {
    $q.notify({
      type: "negative",
      message: "File exceeds 5MB limit",
    });
  } else {
    $q.notify({
      type: "negative",
      message: "Only .html or .vue files are allowed",
    });
  }
};

// Auto-preview basic HTML/Vue files
watch(selectedFile, async (file) => {
  previewContent.value = "";

  if (file && (file.name.endsWith(".html") || file.name.endsWith(".vue"))) {
    try {
      const content = await file.text();
      const escaped = content
        .substring(0, 500)
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      previewContent.value = `<pre>${escaped}${
        content.length > 500 ? "..." : ""
      }</pre>`;
    } catch (err) {
      console.warn("Preview failed:", err);
    }
  }
});
</script>

<style scoped>
.template-preview {
  background: #fafafa;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 200px;
  overflow: auto;
  font-family: monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
