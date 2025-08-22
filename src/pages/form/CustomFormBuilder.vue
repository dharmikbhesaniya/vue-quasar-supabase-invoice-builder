<!-- components/CustomFormBuilder.vue -->
<template>
  <q-page padding>
    <!-- Header -->
    <CustomHeader
      :back-btn="true"
      :title="pageTitle"
      :subtitle="
        isEditing ? 'Update your existing form' : 'Create a new custom form'
      "
    />

    <div class="row q-gutter-md">
      <!-- Left Panel: Form Builder -->
      <div class="col-lg-8 col-md-7 col-12">
        <!-- Form Basic Info -->
        <FormBasicInfo :title="pageTitle" ref="basicInfoRef" />

        <!-- Form Fields List -->
        <FormFieldsList />

        <!-- Form Actions -->
        <FormActions
          :is-editing="(isEditing as boolean)"
          :loading="loading"
          @save="saveForm"
        />
      </div>

      <!-- Right Panel: Live Preview -->
      <div class="col-lg-4 col-md-5 col-12">
        <PreviewForm :fields="formBuilderStore.formFields" />
      </div>
    </div>

    <!-- Add/Edit Field Dialog -->
    <AddEditFieldDialog />
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";
import AddEditFieldDialog from "src/components/form/AddEditFieldDialog.vue";
import FormActions from "src/components/form/FormActions.vue";
import FormBasicInfo from "src/components/form/FormBasicInfo.vue";
import FormFieldsList from "src/components/form/FormFieldsList.vue";
import PreviewForm from "src/components/form/PreviewForm.vue";
import CustomHeader from "src/components/ui/CustomHeader.vue";
import { useCustomFormStore } from "src/stores/customFormStore";
import { useFormBuilderStore } from "src/stores/formBuilder";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

// Composables
const router = useRouter();
const route = useRoute();
const $q = useQuasar();

// Stores
const formBuilderStore = useFormBuilderStore();
const customFormStore = useCustomFormStore();

// Refs
const basicInfoRef = ref();

// Computed
const loading = computed(
  () => customFormStore.loading || formBuilderStore.isLoading
);
const isEditing = computed(
  () => route.params.id && route.params.id !== "create"
);
const pageTitle = computed(() =>
  isEditing.value ? "Edit Form" : "Create Form"
);

// Methods
const loadForm = async () => {
  if (!isEditing.value) return;

  try {
    formBuilderStore.setLoading(true);

    // Check if form exists in store first
    let form = customFormStore.getFormById(route.params.id as string);

    if (!form) {
      // Fetch forms if not in store
      await customFormStore.fetchForms();
      form = customFormStore.getFormById(route.params.id as string);
    }

    if (form) {
      // Populate form data
      formBuilderStore.setFormData({
        name: form.name,
        description: form.description || "",
        is_active: form.is_active,
      });

      // Set current form in store
      customFormStore.setCurrentForm(form);

      // Load form fields
      await customFormStore.fetchFormFields(form.id!);
      formBuilderStore.setFormFields([...customFormStore.currentFormFields]);
    } else {
      // Form not found
      $q.notify({
        type: "negative",
        message: "Form not found",
      });
      router.push("/forms");
    }
  } catch (error) {
    console.error("Error loading form:", error);
    $q.notify({
      type: "negative",
      message: "Failed to load form",
    });
  } finally {
    formBuilderStore.setLoading(false);
  }
};

const saveForm = async () => {
  try {
    // Validate basic info
    const isBasicInfoValid = await basicInfoRef.value?.validate();
    if (!isBasicInfoValid) return;

    // Check if form has fields
    if (!formBuilderStore.hasFields) {
      $q.notify({
        type: "warning",
        message: "Please add at least one field to the form",
      });
      return;
    }

    formBuilderStore.setLoading(true);

    let savedForm;
    const formData = formBuilderStore.formData;

    if (isEditing.value) {
      // Update existing form
      savedForm = await customFormStore.updateForm(route.params.id as string, {
        name: formData.name!,
        description: formData.description || "",
        is_active: formData.is_active!,
      });

      // Handle form fields updates
      await updateFormFields(savedForm.id!);
    } else {
      // Create new form
      savedForm = await customFormStore.createForm({
        name: formData.name!,
        description: formData.description || "",
        is_active: formData.is_active!,
      });

      // Add form fields
      await createFormFields(savedForm.id!);
    }

    // const successMessage = isEditing.value
    //   ? "Form updated successfully!"
    //   : "Form created successfully!";

    // $q.notify({
    //   type: "positive",
    //   message: successMessage,
    // });

    router.push("/forms");
  } catch (error) {
    const errorMessage = isEditing.value
      ? "Failed to update form"
      : "Failed to create form";

    console.error(errorMessage, error);
    $q.notify({
      type: "negative",
      message: errorMessage,
    });
  } finally {
    formBuilderStore.setLoading(false);
  }
};

const updateFormFields = async (formId: string) => {
  // Get existing fields to compare
  const existingFields = customFormStore.currentFormFields;
  const currentFields = formBuilderStore.formFields;

  // Create maps for easier comparison
  const existingFieldsMap = new Map(
    existingFields.map((field) => [field.field_key, field])
  );
  const newFieldsMap = new Map(
    currentFields.map((field) => [field.field_key, field])
  );

  // Delete fields that are no longer present
  for (const existingField of existingFields) {
    if (!newFieldsMap.has(existingField.field_key) && existingField.id) {
      await customFormStore.deleteFormField(existingField.id);
    }
  }

  // Update or create fields
  for (const field of currentFields) {
    const existingField = existingFieldsMap.get(field.field_key);

    if (existingField?.id) {
      // Update existing field
      await customFormStore.updateFormField(existingField.id, {
        ...field,
        form_id: formId,
        id: existingField.id,
      });
    } else {
      // Create new field
      await customFormStore.createFormField({
        ...field,
        form_id: formId,
      });
    }
  }
};

const createFormFields = async (formId: string) => {
  for (const field of formBuilderStore.formFields) {
    await customFormStore.createFormField({
      ...field,
      form_id: formId,
    });
  }
};

// Lifecycle
onMounted(async () => {
  try {
    await loadForm();
  } catch (error) {
    console.error("Failed to initialize form builder:", error);
    $q.notify({
      type: "negative",
      message: "Failed to load form builder",
    });
  }
});

// Cleanup on component unmount
onBeforeUnmount(() => {
  formBuilderStore.clearForm();
});
</script>

<style scoped>
.q-page {
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .row {
    flex-direction: column;
  }
}
</style>
