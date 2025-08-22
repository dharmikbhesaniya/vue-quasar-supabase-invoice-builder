<!-- components/form/FormHeader.vue -->
<template>
  <q-card flat class="q-mb-lg form-header-card">
    <q-card-section class="text-center">
      <div class="row items-center justify-between q-mb-md">
        <div class="col">
          <q-chip
            :color="isCreateMode ? 'positive' : 'primary'"
            text-color="white"
            :label="isCreateMode ? 'Create New' : 'Edit Form'"
            class="q-mb-sm"
          />
        </div>
      </div>

      <h4 class="q-my-sm">
        {{ formTitle }}
      </h4>

      <p v-if="formDescription" class="text-grey-6 q-mb-none">
        {{ formDescription }}
      </p>

      <!-- Create mode hint -->
      <div v-if="isCreateMode" class="q-mt-md">
        <q-banner class="bg-blue-1 text-blue-8" rounded>
          <template v-slot:avatar>
            <q-icon name="info" color="blue" />
          </template>
          You are creating a new form. Fill in all required fields below.
        </q-banner>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from "vue";

// Props
interface Props {
  form?: {
    name?: string;
    description?: string;
  } | null;
  isEditMode?: boolean;
  isCreateMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  form: null,
  isEditMode: false,
  isCreateMode: false,
});

// Computed
const formTitle = computed(() => {
  if (props.isCreateMode) {
    return "Create New Form";
  }
  return props.form?.name || "Form";
});

const formDescription = computed(() => {
  if (props.isCreateMode) {
    return "Fill out the form details below to create a new form.";
  }
  return props.form?.description;
});
</script>

<style scoped>
.form-header-card {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}
</style>
