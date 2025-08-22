<!-- components/form/FormBasicInfo.vue -->
<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">{{ title }}</div>

      <q-form ref="formRef" @submit.prevent="handleSubmit">
        <div class="row q-gutter-md q-mb-md">
          <div class="col">
            <q-input
              v-model="formBuilderStore.formData.name"
              label="Form Name"
              outlined
              dense
              :rules="nameRules"
              lazy-rules
            />
          </div>
          <div class="col-auto">
            <q-toggle
              v-model="formBuilderStore.formData.is_active"
              label="Active"
              color="primary"
            />
          </div>
        </div>

        <q-input
          v-model="formBuilderStore.formData.description"
          label="Form Description"
          type="textarea"
          outlined
          dense
          rows="2"
        />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { useFormBuilderStore } from "src/stores/formBuilder";
import { ref, nextTick } from "vue";

interface Props {
  title: string;
}

defineProps<Props>();

const formBuilderStore = useFormBuilderStore();
const formRef = ref<any>(null);

// Validation rules
const nameRules = [
  (val: string) => (val && val.trim().length > 0) || "Form name is required",
  (val: string) =>
    (val && val.trim().length <= 255) ||
    "Form name must be less than 255 characters",
];

const handleSubmit = (event?: Event) => {
  if (event) {
    event.preventDefault();
  }
  // This will be handled by the parent component
  console.log("Form submitted");
};

const validate = async (): Promise<boolean> => {
  await nextTick(); // Ensure DOM is updated

  if (!formRef.value) {
    console.warn("Form ref is null");
    return false;
  }

  try {
    const result = await formRef.value.validate();
    console.log("Form validation result:", result);
    return result;
  } catch (error) {
    console.error("Form validation error:", error);
    return false;
  }
};

const resetValidation = () => {
  if (formRef.value) {
    formRef.value.resetValidation();
  }
};

// Expose methods to parent component
defineExpose({
  validate,
  resetValidation,
  formRef,
});
</script>
