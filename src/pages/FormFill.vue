<!-- pages/FormFill.vue -->
<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <!-- Loading State -->
        <div v-if="loading" class="text-center q-py-xl">
          <q-spinner color="primary" size="3em" />
          <div class="q-mt-md text-grey-6">Loading form...</div>
        </div>

        <!-- Form Not Found -->
        <div v-else-if="!currentForm" class="text-center q-py-xl">
          <q-icon name="error" size="64px" class="text-grey-4 q-mb-md" />
          <h5 class="text-grey-6 q-my-md">Form not found or inactive</h5>
          <q-btn
            color="primary"
            label="Back to Forms"
            @click="$router.push('/forms')"
            outline
          />
        </div>

        <!-- Form Header -->
        <q-card v-else flat class="q-mb-lg">
          <q-card-section class="text-center">
            <h4 class="q-my-sm">{{ currentForm.name }}</h4>
            <p v-if="currentForm.description" class="text-grey-6 q-mb-none">
              {{ currentForm.description }}
            </p>
          </q-card-section>
        </q-card>

        <!-- Form Content -->
        <q-card v-if="currentForm && !loading">
          <q-card-section class="q-pa-lg">
            <!-- Success Message -->
            <div v-if="submitted" class="text-center q-py-xl">
              <q-icon
                name="check_circle"
                size="64px"
                class="text-positive q-mb-md"
              />
              <h5 class="text-positive q-my-md">
                Form Submitted Successfully!
              </h5>
              <p class="text-grey-6 q-mb-lg">
                Thank you for your submission. Your response has been recorded.
              </p>

              <div class="row justify-center q-gutter-sm">
                <q-btn
                  color="primary"
                  label="Submit Another"
                  @click="resetForm"
                  outline
                />
                <q-btn
                  color="grey"
                  label="Back to Forms"
                  @click="$router.push('/forms')"
                  flat
                />
              </div>
            </div>

            <!-- Form Fields -->
            <CustomFormRenderer
              v-else
              :fields="currentFormFields"
              :form-data="formData"
              :loading="submitting"
              submit-button-text="Submit Form"
              @update:form-data="formData = $event"
              @submit="handleSubmit"
            />
          </q-card-section>
        </q-card>

        <!-- Form Info Footer -->
        <div v-if="currentForm && !submitted" class="text-center q-mt-md">
          <div class="text-caption text-grey-6">
            <q-icon name="info" size="14px" class="q-mr-xs" />
            Fields marked with * are required
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import CustomFormRenderer from "../components/form/CustomFormRenderer.vue";
import { useCustomFormStore } from "../stores/customFormStore";

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

// Methods
const loadForm = async () => {
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

    // Initialize form data
    initializeFormData();
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Failed to load form",
    });
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
      default:
        initialData[field.field_key] = "";
    }
  });

  formData.value = initialData;
};

const handleSubmit = async (submissionData: Record<string, any>) => {
  try {
    submitting.value = true;

    await formStore.submitForm(currentForm.value!.id!, submissionData);

    submitted.value = true;

    $q.notify({
      type: "positive",
      message: "Form submitted successfully!",
      position: "top",
    });
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Failed to submit form. Please try again.",
      position: "top",
    });
  } finally {
    submitting.value = false;
  }
};

const resetForm = () => {
  submitted.value = false;
  initializeFormData();

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

.q-card {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}
</style>
