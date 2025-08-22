<!-- components/form/FormContent.vue -->
<template>
  <q-card flat class="form-content-card">
    <q-card-section class="q-pa-lg">
      <!-- Form Renderer -->
      <CustomFormRenderer
        :fields="fields"
        :form-data="formData"
        :loading="submitting"
        :submit-button-text="submitButtonText"
        @update:form-data="handleFormDataUpdate"
        @submit="handleSubmit"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import CustomFormRenderer from "../form/CustomFormRenderer.vue";

// Props
interface Props {
  fields: any[];
  formData: Record<string, any>;
  submitting?: boolean;
  isEditMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  submitting: false,
  isEditMode: false,
});

// Emits
const emit = defineEmits<{
  "update:form-data": [value: Record<string, any>];
  submit: [data: Record<string, any>];
}>();

// Computed
const submitButtonText = computed(() => {
  if (props.submitting) {
    return props.isEditMode ? "Updating..." : "Creating...";
  }
  return props.isEditMode ? "Update Form" : "Create Form";
});

// Methods
const handleFormDataUpdate = (value: Record<string, any>) => {
  emit("update:form-data", value);
};

const handleSubmit = (data: Record<string, any>) => {
  emit("submit", data);
};
</script>

<style scoped>
.form-content-card {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}
</style>
