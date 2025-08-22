<!-- components/CustomFormRenderer.vue -->
<template>
  <div class="custom-form-renderer">
    <q-form @submit="handleSubmit" ref="formRef">
      <div v-for="field in sortedFields" :key="field.field_key" class="q-mb-md">
        <!-- Text Input -->
        <q-input
          v-if="field.field_type === 'text'"
          v-model="localFormData[field.field_key]"
          :label="field.field_name"
          :placeholder="field.placeholder"
          :rules="getFieldRules(field)"
          outlined
          dense
          :disable="previewMode"
        />

        <!-- Email Input -->
        <q-input
          v-else-if="field.field_type === 'email'"
          v-model="localFormData[field.field_key]"
          type="email"
          :label="field.field_name"
          :placeholder="field.placeholder"
          :rules="getFieldRules(field)"
          outlined
          dense
          :disable="previewMode"
        />

        <!-- Number Input -->
        <q-input
          v-else-if="field.field_type === 'number'"
          v-model="localFormData[field.field_key]"
          type="number"
          :label="field.field_name"
          :placeholder="field.placeholder"
          :rules="getFieldRules(field)"
          outlined
          dense
          :disable="previewMode"
        />

        <!-- Textarea -->
        <q-input
          v-else-if="field.field_type === 'textarea'"
          v-model="localFormData[field.field_key]"
          type="textarea"
          :label="field.field_name"
          :placeholder="field.placeholder"
          :rules="getFieldRules(field)"
          outlined
          dense
          rows="3"
          :disable="previewMode"
        />

        <!-- Date Input -->
        <q-input
          v-else-if="field.field_type === 'date'"
          v-model="localFormData[field.field_key]"
          type="date"
          :label="field.field_name"
          :rules="getFieldRules(field)"
          outlined
          dense
          :disable="previewMode"
        />

        <!-- Select Dropdown -->
        <q-select
          v-else-if="field.field_type === 'select'"
          v-model="localFormData[field.field_key]"
          :options="field.options || []"
          :label="field.field_name"
          :rules="getFieldRules(field)"
          outlined
          dense
          emit-value
          map-options
          option-label="label"
          option-value="value"
          :disable="previewMode"
        />

        <!-- Radio Buttons -->
        <div v-else-if="field.field_type === 'radio'" class="q-field">
          <div class="text-body2 q-mb-sm">{{ field.field_name }}</div>
          <q-option-group
            v-model="localFormData[field.field_key]"
            :options="field.options || []"
            color="primary"
            :disable="previewMode"
          />
          <div
            v-if="getFieldError(field)"
            class="text-negative text-caption q-mt-xs"
          >
            {{ getFieldError(field) }}
          </div>
        </div>

        <!-- Checkboxes -->
        <div v-else-if="field.field_type === 'checkbox'" class="q-field">
          <div class="text-body2 q-mb-sm">{{ field.field_name }}</div>
          <div
            v-for="option in field.options || []"
            :key="option.value"
            class="q-mb-xs"
          >
            <q-checkbox
              v-model="localFormData[field.field_key]"
              :val="option.value"
              :label="option.label"
              color="primary"
              :disable="previewMode"
            />
          </div>
          <div
            v-if="getFieldError(field)"
            class="text-negative text-caption q-mt-xs"
          >
            {{ getFieldError(field) }}
          </div>
        </div>

        <!-- Email Input -->
        <q-editor
          v-else-if="field.field_type === 'editor'"
          v-model="localFormData[field.field_key]"
          :label="field.field_name"
          :placeholder="field.placeholder"
          :rules="getFieldRules(field)"
          outlined
          dense
          :disable="previewMode"
        />

        <!-- File Upload -->
        <q-file
          v-else-if="field.field_type === 'file'"
          v-model="localFormData[field.field_key]"
          :label="field.field_name"
          :rules="getFieldRules(field)"
          outlined
          dense
          :disable="previewMode"
        />
      </div>

      <!-- Submit Button (only show if not in preview mode) -->
      <div v-if="!previewMode" class="row justify-center q-mt-lg">
        <q-btn
          type="submit"
          color="primary"
          size="lg"
          :label="submitButtonText"
          :loading="loading"
          class="q-px-xl"
        />
      </div>
    </q-form>

    <!-- Preview Mode Notice -->
    <div v-if="previewMode" class="text-center q-mt-lg">
      <q-chip color="info" text-color="white" icon="visibility">
        Preview Mode - Form interactions are disabled
      </q-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FormField, ValidationRule } from "src/types/form";
import { ref, computed, watch, reactive } from "vue";

// Props
interface Props {
  fields: FormField[];
  formData?: Record<string, any>;
  previewMode?: boolean;
  submitButtonText?: string;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  formData: () => ({}),
  previewMode: false,
  submitButtonText: "Submit",
  loading: false,
});

// Emits
const emit = defineEmits<{
  "update:form-data": [data: Record<string, any>];
  submit: [data: Record<string, any>];
}>();

// Refs
const formRef = ref();
const fieldErrors = ref<Record<string, string>>({});

// Local form data
const localFormData = reactive<Record<string, any>>({});

// Computed
const sortedFields = computed(() => {
  return [...props.fields].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  );
});

// Methods
const getFieldRules = (field: FormField) => {
  const rules: ((val: any) => boolean | string)[] = [];

  // Required validation
  if (field.is_required) {
    rules.push((val: any) => {
      if (field.field_type === "checkbox") {
        return (
          (Array.isArray(val) && val.length > 0) ||
          `${field.field_name} is required`
        );
      }
      return (
        (val !== null && val !== undefined && val !== "") ||
        `${field.field_name} is required`
      );
    });
  }

  // Custom validation rules
  if (field.validation_rules) {
    field.validation_rules.forEach((rule: ValidationRule) => {
      switch (rule.type) {
        case "email":
          rules.push((val: string) => {
            if (!val) return true; // Skip if empty (handled by required rule)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return (
              emailRegex.test(val) || rule.message || "Invalid email format"
            );
          });
          break;

        case "min":
          rules.push((val: string | number) => {
            if (!val) return true; // Skip if empty
            const length = typeof val === "string" ? val.length : Number(val);
            return (
              length >= Number(rule.value) ||
              rule.message ||
              `Minimum ${rule.value} characters/value required`
            );
          });
          break;

        case "max":
          rules.push((val: string | number) => {
            if (!val) return true; // Skip if empty
            const length = typeof val === "string" ? val.length : Number(val);
            return (
              length <= Number(rule.value) ||
              rule.message ||
              `Maximum ${rule.value} characters/value allowed`
            );
          });
          break;

        case "pattern":
          rules.push((val: string) => {
            if (!val) return true; // Skip if empty
            const regex = new RegExp(rule.value as string);
            return regex.test(val) || rule.message || "Invalid format";
          });
          break;
      }
    });
  }

  return rules;
};

const getFieldError = (field: FormField) => {
  return fieldErrors.value[field.field_key] || null;
};

const validateField = async (field: FormField) => {
  const rules = getFieldRules(field);
  const value = localFormData[field.field_key];

  for (const rule of rules) {
    const result = rule(value);
    if (result !== true) {
      fieldErrors.value[field.field_key] = result as string;
      return false;
    }
  }

  delete fieldErrors.value[field.field_key];
  return true;
};

const validateForm = async () => {
  fieldErrors.value = {};
  let isValid = true;

  for (const field of props.fields) {
    const fieldValid = await validateField(field);
    if (!fieldValid) {
      isValid = false;
    }
  }

  return isValid;
};

const handleSubmit = async () => {
  if (props.previewMode) return;

  if (formRef.value) {
    const isValid = await formRef.value.validate();
    if (isValid) {
      emit("submit", { ...localFormData });
    }
  }
};

const initializeFormData = () => {
  // Initialize form data with default values
  props.fields.forEach((field) => {
    if (!(field.field_key in localFormData)) {
      switch (field.field_type) {
        case "checkbox":
          localFormData[field.field_key] = [];
          break;
        case "number":
          localFormData[field.field_key] = null;
          break;
        default:
          localFormData[field.field_key] = "";
      }
    }
  });

  // Apply any provided form data
  Object.assign(localFormData, props.formData);
};

// Watchers
watch(() => props.fields, initializeFormData, { immediate: true, deep: true });

watch(
  () => props.formData,
  (newData) => {
    Object.assign(localFormData, newData);
  },
  { deep: true }
);

watch(
  localFormData,
  (newData) => {
    emit("update:form-data", { ...newData });
  },
  { deep: true }
);

// Initialize
initializeFormData();
</script>

<style scoped>
.custom-form-renderer {
  width: 100%;
}

.q-field {
  margin-bottom: 16px;
}

.q-field .text-body2 {
  font-weight: 500;
  margin-bottom: 8px;
}
</style>
