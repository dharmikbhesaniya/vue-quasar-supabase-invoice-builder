<!-- pages/FormCreateEdit.vue -->
<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <!-- Loading State -->
        <LoadingState v-if="loading" />

        <!-- Form Not Found (Edit mode only) -->
        <NotFound
          v-else-if="isEditMode && !currentForm"
          @back-to-forms="$router.push('/forms')"
        />

        <!-- Form Header -->
        <FormHeader
          v-if="(isEditMode && currentForm) || isCreateMode"
          :form="currentForm"
          :is-edit-mode="isEditMode"
          :is-create-mode="isCreateMode"
        />

        <!-- Success Message -->
        <FormSuccessMessage
          v-if="submitted"
          :is-edit-mode="isEditMode"
          @submit-another="resetForm"
          @back-to-forms="$router.push('/forms')"
        />

        <!-- Form Content -->
        <FormContent
          v-else-if="shouldShowForm"
          :fields="currentFormFields"
          :form-data="formData"
          :submitting="submitting"
          :is-edit-mode="isEditMode"
          @update:form-data="formData = $event"
          @submit="handleSubmit"
        />

        <!-- Form Info Footer -->
        <FormFooter v-if="shouldShowForm && !submitted" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";
import { useCustomFormStore } from "src/stores/customFormStore";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import LoadingState from "../ui/LoadingState.vue";
import NotFound from "../ui/NotFound.vue";
import FormContent from "./FormContent.vue";
import FormFooter from "./FormFooter.vue";
import FormHeader from "./FormHeader.vue";
import FormSuccessMessage from "./FormSuccessMessage.vue";

const route = useRoute();
const $q = useQuasar();
const formStore = useCustomFormStore();

// Reactive data
const formData = ref<Record<string, any>>({});
const submitted = ref(false);
const submitting = ref(false);

// Computed
const loading = computed(() => formStore.loading);
const currentForm = computed(() => formStore.currentForm);
const currentFormFields = computed(() => formStore.currentFormFields);

const isEditMode = computed(() => !!route.params.id);
const isCreateMode = computed(() => !route.params.id);

const shouldShowForm = computed(() => {
  if (isCreateMode.value) return true;
  if (isEditMode.value) return currentForm.value && !loading.value;
  return false;
});

// Methods
const loadForm = async () => {
  if (isCreateMode.value) {
    // For create mode, initialize empty form
    initializeEmptyForm();
    return;
  }

  // Edit mode - load existing form
  try {
    const formId = route.params.id as string;
    const form = formStore.getFormById(formId);

    if (!form) {
      // Try to fetch forms if not in store
      await formStore.fetchForms();
      const refreshedForm = formStore.getFormById(formId);

      if (!refreshedForm || !refreshedForm.is_active) {
        return;
      }

      formStore.setCurrentForm(refreshedForm);
    } else {
      if (!form.is_active) {
        return;
      }
      formStore.setCurrentForm(form);
    }

    // Load form fields
    await formStore.fetchFormFields(formId);

    // Initialize form data with existing values
    initializeFormData();
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Failed to load form",
    });
  }
};

const initializeEmptyForm = () => {
  // For create mode, set up empty form structure
  formStore.setCurrentForm({
    id: null,
    name: "",
    description: "",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // Initialize with basic form structure
  formStore.setCurrentFormFields([]);
  formData.value = {};
};

const initializeFormData = () => {
  const initialData: Record<string, any> = {};

  if (isEditMode.value) {
    // For edit mode, populate with existing data
    currentFormFields.value.forEach((field) => {
      // You might want to load existing submission data here
      // For now, initialize with default values
      switch (field.field_type) {
        case "checkbox":
          initialData[field.field_key] = [];
          break;
        case "number":
          initialData[field.field_key] = null;
          break;
        default:
          initialData[field.field_key] = "";
      }
    });
  }

  formData.value = initialData;
};

const handleSubmit = async (submissionData: Record<string, any>) => {
  try {
    submitting.value = true;

    if (isCreateMode.value) {
      // Create new form submission
      await formStore.createForm(submissionData);
      $q.notify({
        type: "positive",
        message: "Form created successfully!",
        position: "top",
      });
    } else {
      // Update existing form submission
      await formStore.submitForm(currentForm.value!.id!, submissionData);
      $q.notify({
        type: "positive",
        message: "Form updated successfully!",
        position: "top",
      });
    }

    submitted.value = true;
  } catch (error) {
    const message = isCreateMode.value
      ? "Failed to create form. Please try again."
      : "Failed to update form. Please try again.";

    $q.notify({
      type: "negative",
      message,
      position: "top",
    });
  } finally {
    submitting.value = false;
  }
};

const resetForm = () => {
  submitted.value = false;

  if (isCreateMode.value) {
    initializeEmptyForm();
  } else {
    initializeFormData();
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Lifecycle
onMounted(async () => {
  await loadForm();
});
</script>

<style scoped>
.q-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}
</style>
