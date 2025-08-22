<!-- components/CustomFormBuilder.vue -->
<template>
  <q-page padding>
    <!-- Breadcrumb Navigation -->
    <CustomHeader
      :back-btn="true"
      :title="pageTitle"
      :subtitle="
        isEditing ? 'Update your existing form' : 'Create a new custom form'
      " />

    <div class="row q-gutter-md">
      <!-- Left Panel: Form Builder -->

      <div class="col-md-8 col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ pageTitle }}</div>

            <!-- Form Basic Info -->
            <q-form @submit="saveForm" ref="formRef">
              <div class="row q-gutter-md q-mb-md">
                <div class="col">
                  <q-input
                    v-model="formData.name"
                    label="Form Name"
                    outlined
                    dense
                    :rules="[(val) => !!val || 'Form name is required']"
                  />
                </div>
                <div class="col">
                  <q-toggle
                    v-model="formData.is_active"
                    label="Active"
                    color="primary"
                  />
                </div>
              </div>

              <q-input
                v-model="formData.description"
                label="Form Description"
                type="textarea"
                outlined
                dense
                rows="2"
              />
            </q-form>
          </q-card-section>
        </q-card>
        <!-- Form Fields Builder -->
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="row justify-between items-center q-mb-md">
              <div class="text-h6">Form Fields</div>
              <q-btn
                color="primary"
                icon="add"
                label="Add Field"
                @click="showAddFieldDialog = true"
                dense
              />
            </div>

            <!-- Fields List -->
            <div
              v-if="formFields.length === 0"
              class="text-center text-grey-6 q-py-xl"
            >
              <q-icon name="description" size="48px" class="q-mb-md" />
              <div>
                No fields added yet. Click "Add Field" to start building your
                form.
              </div>
            </div>
            <div class="q-gutter-sm">
              <q-card
                v-for="(field, index) in formFields"
                :key="field.field_key"
                flat
                bordered
                class="field-card q-mb-sm"
                :class="{
                  'bg-blue-1': editingField?.field_key === field.field_key,
                }"
              >
                <q-card-section class="row items-center q-pa-md">
                  <q-icon
                    name="drag_indicator"
                    class="drag-handle cursor-pointer q-mr-sm text-grey-6"
                  />

                  <div class="col">
                    <div class="row items-center q-gutter-sm">
                      <q-chip
                        :icon="getFieldTypeIcon(field.field_type)"
                        :label="field.field_type"
                        size="sm"
                        color="primary"
                        outline
                      />
                      <span class="text-weight-medium">{{
                        field.field_name
                      }}</span>
                      <q-badge
                        v-if="field.is_required"
                        color="orange"
                        label="Required"
                      />
                    </div>
                    <div class="text-caption text-grey-6">
                      Key: {{ field.field_key }}
                    </div>
                    <div
                      v-if="field.placeholder"
                      class="text-caption text-grey-6"
                    >
                      Placeholder: {{ field.placeholder }}
                    </div>
                  </div>

                  <div class="row q-gutter-xs">
                    <q-btn
                      flat
                      round
                      icon="edit"
                      size="sm"
                      @click="editField(field)"
                      color="primary"
                    />
                    <q-btn
                      flat
                      round
                      icon="delete"
                      size="sm"
                      @click="deleteField(index)"
                      color="negative"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
        <!-- Save Form Button -->
        <div class="row justify-center q-mt-md">
          <q-btn
            color="primary"
            size="lg"
            :label="saveButtonText"
            @click="saveForm"
            :loading="loading"
            class="q-px-xl"
          />
        </div>
      </div>

      <!-- Right Panel: Live Preview -->
      <PreviewForm :fields="formFields" />
    </div>

    <!-- TODO: create septate component of this dialog -->
    <!-- Add/Edit Field Dialog -->
    <q-dialog v-model="showAddFieldDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ editingField ? "Edit Field" : "Add Field" }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="addField" ref="fieldFormRef">
            <div class="row q-gutter-md">
              <div class="col">
                <q-input
                  v-model="currentField.field_name"
                  label="Field Name"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Field name is required']"
                />
              </div>
              <div class="col">
                <q-input
                  v-model="currentField.field_key"
                  label="Field Key"
                  outlined
                  dense
                  hint="Used to store data (e.g., email, phone)"
                  :rules="[
                    (val) => !!val || 'Field key is required',
                    (val) =>
                      /^[a-zA-Z][a-zA-Z0-9_]*$/.test(val) ||
                      'Key must start with letter and contain only letters, numbers, and underscores',
                  ]"
                />
              </div>
            </div>

            <q-select
              v-model="currentField.field_type"
              :options="fieldTypeOptions"
              label="Field Type"
              outlined
              dense
              emit-value
              map-options
              class="q-mt-md"
            />

            <q-input
              v-model="currentField.placeholder"
              label="Placeholder"
              outlined
              dense
              class="q-mt-md"
            />

            <div class="row items-center q-mt-md">
              <q-toggle
                v-model="currentField.is_required"
                label="Required Field"
                color="primary"
              />
            </div>

            <!-- Options for select, radio, checkbox -->
            <div
              v-if="
                ['select', 'radio', 'checkbox'].includes(
                  currentField.field_type as string
                )
              "
              class="q-mt-md"
            >
              <div class="text-subtitle2 q-mb-sm">Options</div>
              <div
                v-for="(option, index) in currentField.options"
                :key="index"
                class="row q-gutter-sm q-mb-sm"
              >
                <div class="col">
                  <q-input
                    v-model="option.label"
                    label="Label"
                    outlined
                    dense
                  />
                </div>
                <div class="col">
                  <q-input
                    v-model="option.value"
                    label="Value"
                    outlined
                    dense
                  />
                </div>
                <q-btn
                  flat
                  round
                  icon="remove"
                  size="sm"
                  @click="removeOption(index)"
                  color="negative"
                />
              </div>
              <q-btn
                flat
                icon="add"
                label="Add Option"
                @click="addOption"
                color="primary"
                size="sm"
              />
            </div>

            <!-- Validation Rules -->
            <div class="q-mt-md">
              <div class="text-subtitle2 q-mb-sm">Validation Rules</div>
              <div
                v-for="(rule, index) in currentField.validation_rules"
                :key="index"
                class="row q-gutter-sm q-mb-sm items-center"
              >
                <div class="col-3">
                  <q-select
                    v-model="rule.type"
                    :options="validationTypeOptions"
                    outlined
                    dense
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-3" v-if="['min', 'max'].includes(rule.type)">
                  <q-input
                    v-model="rule.value"
                    type="number"
                    outlined
                    dense
                    label="Value"
                  />
                </div>
                <div class="col-3" v-else-if="rule.type === 'pattern'">
                  <q-input
                    v-model="rule.value"
                    outlined
                    dense
                    label="Pattern"
                  />
                </div>
                <div class="col">
                  <q-input
                    v-model="rule.message"
                    outlined
                    dense
                    label="Error Message"
                  />
                </div>
                <q-btn
                  flat
                  round
                  icon="remove"
                  size="sm"
                  @click="removeValidationRule(index)"
                  color="negative"
                />
              </div>
              <q-btn
                flat
                icon="add"
                label="Add Rule"
                @click="addValidationRule"
                color="primary"
                size="sm"
              />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelFieldEdit" />
          <q-btn color="primary" label="Save Field" @click="addField" />
        </q-card-actions>
      </q-card> </q-dialog
  ></q-page>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";
import PreviewForm from "src/components/form/PreviewForm.vue";
import CustomHeader from "src/components/ui/CustomHeader.vue";
import { fieldTypeOptions, validationTypeOptions } from "src/constants/form";
import { useCustomFormStore } from "src/stores/customFormStore";
import { CustomForm, FormField } from "src/types/form";
import { getFieldTypeIcon } from "src/utils/form";
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const formStore = useCustomFormStore();

// Check if $q is properly initialized
if (!$q || !$q.notify) {
  console.error("Quasar not properly initialized");
}

// Refs
const formRef = ref();
const fieldFormRef = ref();
// TODO: move below variable in to formBuild store
const formFields = ref<FormField[]>([]);
const showAddFieldDialog = ref(false);
const editingField = ref<FormField | null>(null);

// Reactive data
const formData = reactive<Partial<CustomForm>>({
  name: "",
  description: "",
  is_active: true,
});

// Current field being edited
const currentField = reactive<Partial<FormField>>({
  field_name: "",
  field_key: "",
  field_type: "text",
  placeholder: "",
  is_required: false,
  options: [],
  validation_rules: [],
  sort_order: 0,
});

// Computed
const loading = computed(() => formStore.loading);
const isEditing = computed(
  () => route.params.id && route.params.id !== "create"
);
const pageTitle = computed(() =>
  isEditing.value ? "Edit Form" : "Create Form"
);
const saveButtonText = computed(() =>
  isEditing.value ? "Update Form" : "Create Form"
);

// Methods

const resetCurrentField = () => {
  Object.assign(currentField, {
    field_name: "",
    field_key: "",
    field_type: "text",
    placeholder: "",
    is_required: false,
    options: [],
    validation_rules: [],
    sort_order: formFields.value.length,
  });
};

const editField = (field: FormField) => {
  editingField.value = field;
  // Deep copy the field to avoid direct mutation
  Object.assign(currentField, {
    ...field,
    options: field.options ? JSON.parse(JSON.stringify(field.options)) : [],
    validation_rules: field.validation_rules
      ? JSON.parse(JSON.stringify(field.validation_rules))
      : [],
  });
  showAddFieldDialog.value = true;
};

const cancelFieldEdit = () => {
  showAddFieldDialog.value = false;
  editingField.value = null;
  resetCurrentField();
};

const addField = async () => {
  if (!fieldFormRef.value) return;

  const isValid = await fieldFormRef.value.validate();
  if (!isValid) return;

  // Check for duplicate field keys (excluding current field if editing)
  const existingFieldIndex = formFields.value.findIndex(
    (f: { field_key: any }) =>
      f.field_key === currentField.field_key && f !== editingField.value
  );

  if (existingFieldIndex !== -1) {
    console.error("Field key must be unique");
    if ($q && $q.notify) {
      $q.notify({
        type: "negative",
        message: "Field key must be unique",
      });
    }
    return;
  }

  // Create a clean field object
  const fieldData = {
    field_name: currentField.field_name!,
    field_key: currentField.field_key!,
    field_type: currentField.field_type!,
    placeholder: currentField.placeholder || "",
    is_required: currentField.is_required || false,
    options: currentField.options
      ? JSON.parse(JSON.stringify(currentField.options))
      : [],
    validation_rules: currentField.validation_rules
      ? JSON.parse(JSON.stringify(currentField.validation_rules))
      : [],
    sort_order: currentField.sort_order || formFields.value.length,
  };

  if (editingField.value) {
    // Update existing field
    const index = formFields.value.findIndex(
      (f: { field_key: any }) => f.field_key === editingField.value!.field_key
    );
    if (index !== -1) {
      // Preserve the original field's ID and other metadata if it exists
      formFields.value[index] = {
        ...fieldData,
        id: editingField.value.id,
        form_id: editingField.value.form_id,
        created_at: editingField.value.created_at,
        // updated_at: editingField.value.updated_at,
      } as FormField;
    }
  } else {
    // Add new field
    formFields.value.push(fieldData as FormField);
  }

  // Update field order
  updateFieldsOrder();

  cancelFieldEdit();

  const message = editingField.value
    ? "Field updated successfully"
    : "Field added successfully";

  if ($q && $q.notify) {
    $q.notify({
      type: "positive",
      message: message,
    });
  } else {
    console.log(message);
  }
};

const deleteField = (index: number) => {
  const dialogOptions = {
    title: "Confirm Delete",
    message: "Are you sure you want to delete this field?",
    cancel: true,
    persistent: true,
  };

  if ($q && $q.dialog) {
    $q.dialog(dialogOptions).onOk(() => {
      formFields.value.splice(index, 1);
      updateFieldsOrder();
    });
  } else {
    // Fallback to native confirm
    if (confirm("Are you sure you want to delete this field?")) {
      formFields.value.splice(index, 1);
      updateFieldsOrder();
    }
  }
};

const updateFieldsOrder = () => {
  formFields.value.forEach((field: { sort_order: any }, index: any) => {
    field.sort_order = index;
  });
};

const addOption = () => {
  if (!currentField.options) currentField.options = [];
  currentField.options.push({ label: "", value: "" });
};

const removeOption = (index: number) => {
  currentField.options?.splice(index, 1);
};

const addValidationRule = () => {
  if (!currentField.validation_rules) currentField.validation_rules = [];
  currentField.validation_rules.push({ type: "required", message: "" });
};

const removeValidationRule = (index: number) => {
  currentField.validation_rules?.splice(index, 1);
};

const saveForm = async () => {
  if (!formRef.value) return;

  const isValid = await formRef.value.validate();
  if (!isValid) return;

  if (formFields.value.length === 0) {
    const warningMessage = "Please add at least one field to the form";
    if ($q && $q.notify) {
      $q.notify({
        type: "warning",
        message: warningMessage,
      });
    } else {
      alert(warningMessage);
    }
    return;
  }

  try {
    let savedForm: CustomForm;
    const isEditing = route.params.id && route.params.id !== "create";

    if (isEditing) {
      // Update existing form
      savedForm = await formStore.updateForm(route.params.id as string, {
        name: formData.name!,
        description: formData.description || "",
        is_active: formData.is_active!,
      });

      // Get existing fields to compare
      const existingFields = formStore.currentFormFields;

      // Create maps for easier comparison
      const existingFieldsMap = new Map(
        existingFields.map((field) => [field.field_key, field])
      );
      const newFieldsMap = new Map(
        formFields.value.map((field) => [field.field_key, field])
      );

      // Delete fields that are no longer present
      for (const existingField of existingFields) {
        if (!newFieldsMap.has(existingField.field_key) && existingField.id) {
          await formStore.deleteFormField(existingField.id);
        }
      }

      // Update or create fields
      for (const field of formFields.value) {
        const existingField = existingFieldsMap.get(field.field_key);

        if (existingField && existingField.id) {
          // Update existing field
          await formStore.updateFormField(existingField.id, {
            ...field,
            form_id: savedForm.id!,
            id: existingField.id,
          });
        } else {
          // Create new field
          await formStore.createFormField({
            ...field,
            form_id: savedForm.id!,
          });
        }
      }
    } else {
      // Create new form
      savedForm = await formStore.createForm({
        name: formData.name!,
        description: formData.description || "",
        is_active: formData.is_active!,
      });

      // Add form fields
      for (const field of formFields.value) {
        await formStore.createFormField({
          ...field,
          form_id: savedForm.id!,
        });
      }
    }

    // const successMessage = isEditing
    //   ? "Form updated successfully!"
    //   : "Form created successfully!";

    // if ($q && $q.notify) {
    //   $q.notify({
    //     type: "positive",
    //     message: successMessage,
    //   });
    // } else {
    //   console.log(successMessage);
    // }

    router.push("/forms");
  } catch (error) {
    const errorMessage =
      route.params.id && route.params.id !== "create"
        ? "Failed to update form"
        : "Failed to create form";

    if ($q && $q.notify) {
      $q.notify({
        type: "negative",
        message: errorMessage,
      });
    } else {
      console.error(errorMessage, error);
    }
  }
};

const loadForm = async () => {
  if (route.params.id && route.params.id !== "create") {
    try {
      // Check if form exists in store first
      let form = formStore.getFormById(route.params.id as string);

      if (!form) {
        // Fetch forms if not in store
        await formStore.fetchForms();
        form = formStore.getFormById(route.params.id as string);
      }

      if (form) {
        // Populate form data for editing
        Object.assign(formData, {
          name: form.name,
          description: form.description || "",
          is_active: form.is_active,
        });

        // Set current form in store
        formStore.setCurrentForm(form);

        // Load form fields
        await formStore.fetchFormFields(form.id!);
        formFields.value = [...formStore.currentFormFields];
      } else {
        // Form not found, redirect to forms list
        if ($q && $q.notify) {
          $q.notify({
            type: "negative",
            message: "Form not found",
          });
        }
        router.push("/forms");
      }
    } catch (error) {
      console.error("Error loading form:", error);
      if ($q && $q.notify) {
        $q.notify({
          type: "negative",
          message: "Failed to load form",
        });
      }
    }
  }
};

// Lifecycle
onMounted(async () => {
  try {
    await loadForm();
    resetCurrentField();
  } catch (error) {
    console.error("Failed to initialize form builder:", error);
    if ($q && $q.notify) {
      $q.notify({
        type: "negative",
        message: "Failed to load form builder",
      });
    }
  }
});
</script>

<style scoped>
.field-card {
  transition: all 0.3s ease;
}

.field-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.drag-handle {
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}
</style>
