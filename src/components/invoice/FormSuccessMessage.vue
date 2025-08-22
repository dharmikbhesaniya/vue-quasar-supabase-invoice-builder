<!-- components/form/FormSuccessMessage.vue -->
<template>
  <q-card flat class="success-card">
    <q-card-section class="q-pa-lg">
      <div class="text-center q-py-xl">
        <q-icon name="check_circle" size="64px" class="text-positive q-mb-md" />
        <h5 class="text-positive q-my-md">
          {{ successTitle }}
        </h5>
        <p class="text-grey-6 q-mb-lg">
          {{ successMessage }}
        </p>

        <div class="row justify-center q-gutter-sm">
          <q-btn
            color="primary"
            :label="submitAnotherLabel"
            @click="handleSubmitAnother"
            outline
          />
          <q-btn
            color="grey"
            label="Back to Forms"
            @click="handleBackToForms"
            flat
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from "vue";

// Props
interface Props {
  isEditMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEditMode: false,
});

// Emits
const emit = defineEmits<{
  "submit-another": [];
  "back-to-forms": [];
}>();

// Computed
const successTitle = computed(() => {
  return props.isEditMode
    ? "Form Updated Successfully!"
    : "Form Created Successfully!";
});

const successMessage = computed(() => {
  return props.isEditMode
    ? "Your changes have been saved successfully."
    : "Thank you for your submission. Your form has been created.";
});

const submitAnotherLabel = computed(() => {
  return props.isEditMode ? "Edit Again" : "Create Another";
});

// Methods
const handleSubmitAnother = () => {
  emit("submit-another");
};

const handleBackToForms = () => {
  emit("back-to-forms");
};
</script>

<style scoped>
.success-card {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}
</style>
