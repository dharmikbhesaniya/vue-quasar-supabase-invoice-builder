<!-- components/form/FormFieldsList.vue -->
<template>
  <q-card class="q-mt-md">
    <q-card-section>
      <div class="row justify-between items-center q-mb-md">
        <div class="text-h6">Form Fields</div>
        <q-btn
          color="primary"
          icon="add"
          label="Add Field"
          @click="formBuilderStore.openAddFieldDialog()"
          dense
        />
      </div>

      <!-- Empty State -->
      <div
        v-if="!formBuilderStore.hasFields"
        class="text-center text-grey-6 q-py-xl"
      >
        <q-icon name="description" size="48px" class="q-mb-md" />
        <div class="text-body1">
          No fields added yet. Click "Add Field" to start building your form.
        </div>
      </div>

      <!-- Fields List -->
      <div v-else class="q-gutter-sm">
        <FormFieldItem
          v-for="(field, index) in formBuilderStore.formFields"
          :key="`field-${field.field_key}-${index}`"
          :field="field"
          :index="index"
          :is-editing="
            formBuilderStore.editingField?.field_key === field.field_key
          "
          @edit="formBuilderStore.openEditFieldDialog(field)"
          @delete="handleDeleteField(index)"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";
import FormFieldItem from "./FormFieldItem.vue";
import { useFormBuilderStore } from "src/stores/formBuilder";

const $q = useQuasar();
const formBuilderStore = useFormBuilderStore();

const handleDeleteField = (index: number) => {
  const dialogOptions = {
    title: "Confirm Delete",
    message: "Are you sure you want to delete this field?",
    cancel: true,
    persistent: true,
  };

  if ($q?.dialog) {
    $q.dialog(dialogOptions).onOk(() => {
      formBuilderStore.deleteField(index);
      $q.notify({
        type: "positive",
        message: "Field deleted successfully",
      });
    });
  } else {
    // Fallback to native confirm
    if (confirm("Are you sure you want to delete this field?")) {
      formBuilderStore.deleteField(index);
    }
  }
};
</script>
