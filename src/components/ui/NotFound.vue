<!-- components/form/FormNotFound.vue -->
<template>
  <div class="text-center q-py-xl">
    <q-icon name="error" size="64px" class="text-grey-4 q-mb-md" />
    <h5 class="text-grey-6 q-my-md">Form not found or inactive</h5>
    <q-btn
      color="primary"
      label="Back to Forms"
      @click="handleBackToForms"
      outline
    />
  </div>
</template>

<script setup lang="ts">
// Emits
const emit = defineEmits<{
  'back-to-forms': []
}>();

const handleBackToForms = () => {
  emit('back-to-forms');
};
</script>

<style scoped>
/* Component-specific styles if needed */
</style>
