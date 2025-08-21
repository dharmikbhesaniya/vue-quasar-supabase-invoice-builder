<!-- components/CustomFormBuilder.vue -->
<template>
  <q-page padding>
    <div class="row q-gutter-md">
      <!-- Left Panel: Form Builder -->

      <div class="col-md-8 col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Form Builder</div>

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
            label="Save Form"
            @click="saveForm"
            :loading="loading"
            class="q-px-xl"
          />
        </div>
      </div>
      <!-- Right Panel: Live Preview -->
      <div class="col-md-4 col-12">
        <q-card sticky>
          <q-card-section>
            <div class="text-h6">Live Preview</div>
            <q-separator class="q-my-md" />

            <div
              v-if="formFields.length === 0"
              class="text-center text-grey-6 q-py-xl"
            >
              <q-icon name="preview" size="32px" class="q-mb-md" />
              <div>Add fields to see preview</div>
            </div>

            <CustomFormRenderer
              v-else
              :fields="formFields"
              :form-data="previewData"
              @update:form-data="previewData = $event"
              preview-mode
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
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
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useQuasar } from "quasar";
import CustomFormRenderer from "./CustomFormRenderer.vue";
import draggable from "vuedraggable";
import {
  CustomForm,
  FormField,
  useCustomFormStore,
} from "src/stores/customFormStore";

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const formStore = useCustomFormStore();

// Refs
const formRef = ref();
const fieldFormRef = ref();

// Reactive data
const formData = reactive<Partial<CustomForm>>({
  name: "",
  description: "",
  is_active: true,
});

const formFields = ref<FormField[]>([]);
const showAddFieldDialog = ref(false);
const editingField = ref<FormField | null>(null);
const previewData = ref<Record<string, any>>({});

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

// Field type options
const fieldTypeOptions = [
  { label: "Text", value: "text" },
  { label: "Email", value: "email" },
  { label: "Number", value: "number" },
  { label: "Textarea", value: "textarea" },
  { label: "Select", value: "select" },
  { label: "Checkbox", value: "checkbox" },
  { label: "Radio", value: "radio" },
  { label: "Date", value: "date" },
  { label: "File", value: "file" },
];

// Validation type options
const validationTypeOptions = [
  { label: "Required", value: "required" },
  { label: "Email", value: "email" },
  { label: "Minimum Length", value: "min" },
  { label: "Maximum Length", value: "max" },
  { label: "Pattern", value: "pattern" },
];

// Methods
const getFieldTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    text: "text_fields",
    email: "email",
    number: "numbers",
    textarea: "subject",
    select: "arrow_drop_down",
    checkbox: "check_box",
    radio: "radio_button_checked",
    date: "event",
    file: "attach_file",
  };
  return icons[type] || "text_fields";
};

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
  Object.assign(currentField, {
    ...field,
    options: field.options ? [...field.options] : [],
    validation_rules: field.validation_rules ? [...field.validation_rules] : [],
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

  // Check for duplicate field keys
  const existingFieldIndex = formFields.value.findIndex(
    (f: { field_key: any }) =>
      f.field_key === currentField.field_key && f !== editingField.value
  );

  if (existingFieldIndex !== -1) {
    $q.notify({
      type: "negative",
      message: "Field key must be unique",
    });
    return;
  }

  if (editingField.value) {
    // Update existing field
    const index = formFields.value.findIndex(
      (f: { field_key: any }) => f.field_key === editingField.value!.field_key
    );
    if (index !== -1) {
      formFields.value[index] = { ...currentField } as FormField;
    }
  } else {
    // Add new field
    formFields.value.push({ ...currentField } as FormField);
  }

  cancelFieldEdit();

  $q.notify({
    type: "positive",
    message: editingField.value
      ? "Field updated successfully"
      : "Field added successfully",
  });
};

const deleteField = (index: number) => {
  $q.dialog({
    title: "Confirm Delete",
    message: "Are you sure you want to delete this field?",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    formFields.value.splice(index, 1);
    updateFieldsOrder();
  });
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
    $q.notify({
      type: "warning",
      message: "Please add at least one field to the form",
    });
    return;
  }

  try {
    let savedForm: CustomForm;

    if (route.params.id) {
      // Update existing form
      savedForm = await formStore.updateForm(
        route.params.id as string,
        formData
      );

      // Update form fields
      // First, delete existing fields
      for (const field of formStore.currentFormFields) {
        if (field.id) {
          await formStore.deleteFormField(field.id);
        }
      }

      // Then add new fields
      for (const field of formFields.value) {
        await formStore.createFormField({
          ...field,
          form_id: savedForm.id!,
        });
      }
    } else {
      // Create new form
      savedForm = await formStore.createForm(
        formData as Omit<CustomForm, "id" | "created_at" | "updated_at">
      );

      // Add form fields
      for (const field of formFields.value) {
        await formStore.createFormField({
          ...field,
          form_id: savedForm.id!,
        });
      }
    }

    $q.notify({
      type: "positive",
      message: "Form saved successfully!",
    });

    router.push("/forms");
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Failed to save form",
    });
  }
};

const loadForm = async () => {
  if (route.params.id) {
    const form = formStore.getFormById(route.params.id as string);
    if (form) {
      Object.assign(formData, form);
      await formStore.fetchFormFields(form.id!);
      formFields.value = [...formStore.currentFormFields];
    }
  }
};

// Lifecycle
onMounted(async () => {
  await loadForm();
  resetCurrentField();
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