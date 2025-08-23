<template>
  <div class="row justify-center">
    <div class="col-12 col-md-8 col-lg-6">
      <!-- Loading State -->
      <LoadingState v-if="loading" />

      <!-- Form Not Found -->
      <NotFound
        v-else-if="!currentForm"
        @back-to-forms="$emit('back-to-forms')"
      />

      <!-- Form Header -->
      <FormHeader
        v-if="currentForm"
        :form="currentForm"
        :is-edit-mode="isEditMode"
        :is-create-mode="isCreateMode"
      />

      <!-- Success Message -->
      <FormSuccessMessage
        v-if="submitted"
        :is-edit-mode="isEditMode"
        @submit-another="resetForm"
        @back-to-forms="$emit('back-to-forms')"
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
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";
import { useCustomFormStore } from "src/stores/customFormStore";
import { computed, onMounted, ref } from "vue";
import LoadingState from "../ui/LoadingState.vue";
import NotFound from "../ui/NotFound.vue";
import FormContent from "./FormContent.vue";
import FormFooter from "./FormFooter.vue";
import FormHeader from "./FormHeader.vue";
import FormSuccessMessage from "./FormSuccessMessage.vue";

const props = defineProps<{
  customerFormId: string; // ID of the custom form template
  formId?: string | undefined; // ID of the form submission (for editing)
}>();

const emit = defineEmits<{
  (e: "back-to-forms"): void;
  (e: "submitted", data: any): void;
}>();

const $q = useQuasar();
const formStore = useCustomFormStore();

// Reactive data
const formData = ref<Record<string, any>>({});
const submitted = ref(false);
const submitting = ref(false);
const currentSubmission = ref<any>(null);

// Computed
const loading = computed(() => formStore.loading);
const currentForm = computed(() => formStore.currentForm);
const currentFormFields = computed(() => formStore.currentFormFields);

// isEditMode is true when we have a formId (editing existing submission)
// isCreateMode is true when we don't have formId (creating new submission)
const isEditMode = computed(() => !!props.formId);
const isCreateMode = computed(() => !props.formId);

const shouldShowForm = computed(() => {
  return currentForm.value && !loading.value && !submitted.value;
});

// Methods
const loadForm = async () => {
  try {
    // Always load the custom form template based on customerFormId
    await loadCustomForm();

    // If formId is provided, load the existing submission data
    if (props.formId) {
      await loadFormSubmission();
    } else {
      // Initialize empty form data for new submission
      initializeFormData();
    }
  } catch (error) {
    console.error("Error loading form:", error);
    $q.notify({
      type: "negative",
      message: "Failed to load form",
    });
  }
};

const loadCustomForm = async () => {
  const customerFormId = props.customerFormId;
  let form = formStore.getFormById(customerFormId);

  if (!form) {
    // If form not in store, fetch all forms
    await formStore.fetchForms();
    form = formStore.getFormById(customerFormId);
  }

  if (!form) {
    throw new Error("Custom form not found");
  }

  if (!form.is_active) {
    throw new Error("Form is not active");
  }

  // Set current form and load its fields
  formStore.setCurrentForm(form);
  await formStore.fetchFormFields(customerFormId);
};

const loadFormSubmission = async () => {
  try {
    // Fetch all submissions for this form to find the specific one
    await formStore.fetchFormSubmissions(props.customerFormId);

    // Find the specific submission
    const submission = formStore.formSubmissions.find(
      (sub) => sub.id === props.formId
    );

    if (!submission) {
      throw new Error("Form submission not found");
    }

    currentSubmission.value = submission;

    // Pre-fill form data with submission data
    formData.value = { ...submission.form_data };
  } catch (error) {
    console.error("Error loading form submission:", error);
    throw error;
  }
};

const initializeFormData = () => {
  const initialData: Record<string, any> = {};

  currentFormFields.value.forEach((field) => {
    switch (field.field_type) {
      case "checkbox":
        initialData[field.field_key] = [];
        break;
      case "number":
        initialData[field.field_key] = null;
        break;
      // case "boolean":
      case "radio":
        initialData[field.field_key] = false;
        break;
      default:
        initialData[field.field_key] = "";
    }
  });

  formData.value = initialData;
};

const handleSubmit = async (submissionData: Record<string, any>) => {
  try {
    submitting.value = true;

    if (isEditMode.value) {
      // Update existing form submission
      await updateFormSubmission(submissionData);
      $q.notify({
        type: "positive",
        message: "Form updated successfully!",
      });
    } else {
      // Create new form submission
      await formStore.submitForm(currentForm.value!.id!, submissionData);
      $q.notify({
        type: "positive",
        message: "Form submitted successfully!",
      });
    }

    submitted.value = true;
    emit("submitted", submissionData);
  } catch (error) {
    console.error("Error submitting form:", error);
    $q.notify({
      type: "negative",
      message: isEditMode.value
        ? "Failed to update form submission. Please try again."
        : "Failed to submit form. Please try again.",
    });
  } finally {
    submitting.value = false;
  }
};

const updateFormSubmission = async (submissionData: Record<string, any>) => {
  return await formStore.updateFormSubmission(props.formId!, submissionData);
};

const resetForm = () => {
  submitted.value = false;

  if (isEditMode.value) {
    // Reset to original submission data
    formData.value = { ...currentSubmission.value.form_data };
  } else {
    // Reset to empty form
    initializeFormData();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Lifecycle
onMounted(async () => {
  await loadForm();
});
</script>
