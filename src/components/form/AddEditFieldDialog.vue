<!-- components/form/AddEditFieldDialog.vue -->
<template>
  <q-dialog
    v-model="formBuilderStore.showAddFieldDialog"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="dialog-card">
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>
          {{ formBuilderStore.isEditing ? "Edit Field" : "Add New Field" }}
        </q-toolbar-title>
        <q-btn
          flat
          round
          dense
          icon="close"
          @click="formBuilderStore.closeFieldDialog()"
        />
      </q-toolbar>

      <q-card-section class="q-pa-lg">
        <q-form @submit="handleSubmit" ref="fieldFormRef" class="q-gutter-md">
          <!-- Basic Field Info -->
          <div class="row q-gutter-md">
            <div class="col-md-6 col-12">
              <q-input
                v-model="formBuilderStore.currentField.field_name"
                label="Field Name"
                outlined
                :rules="[(val) => !!val || 'Field name is required']"
              />
            </div>
            <div class="col-md-6 col-12">
              <q-input
                v-model="formBuilderStore.currentField.field_key"
                label="Field Key"
                outlined
                hint="Used to store data (e.g., email, phone)"
                :rules="[
                  (val) => !!val || 'Field key is required',
                  (val) =>
                    /^[a-zA-Z][a-zA-Z0-9_]*$/.test(val) ||
                    'Key must start with letter and contain only letters, numbers, and underscores',
                  (val) =>
                    formBuilderStore.validateFieldKey(val) ||
                    'Field key must be unique',
                ]"
              />
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col-md-6 col-12">
              <q-select
                v-model="formBuilderStore.currentField.field_type"
                :options="fieldTypeOptions"
                label="Field Type"
                outlined
                emit-value
                map-options
              />
            </div>
            <div class="col-md-6 col-12">
              <q-input
                v-model="formBuilderStore.currentField.placeholder"
                label="Placeholder"
                outlined
              />
            </div>
          </div>

          <!-- Field Settings -->
          <div class="row">
            <div class="col">
              <q-toggle
                v-model="formBuilderStore.currentField.is_required"
                label="Required Field"
                color="primary"
              />
            </div>
          </div>

          <!-- Field Options -->
          <FieldOptionsEditor
            v-if="shouldShowOptions"
            :options="formBuilderStore.currentField.options || []"
            @add="formBuilderStore.addOption"
            @remove="formBuilderStore.removeOption"
          />

          <!-- Validation Rules -->
          <ValidationRulesEditor
            :rules="formBuilderStore.currentField.validation_rules || []"
            @add="formBuilderStore.addValidationRule"
            @remove="formBuilderStore.removeValidationRule"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-lg">
        <q-btn
          flat
          label="Cancel"
          @click="formBuilderStore.closeFieldDialog()"
          class="q-mr-sm"
        />
        <q-btn
          color="primary"
          :label="formBuilderStore.isEditing ? 'Update Field' : 'Add Field'"
          @click="handleSubmit"
          :loading="formBuilderStore.isLoading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useQuasar } from "quasar";
import { fieldTypeOptions } from "src/constants/form";
import FieldOptionsEditor from "./FieldOptionsEditor.vue";
import ValidationRulesEditor from "./ValidationRulesEditor.vue";
import { useFormBuilderStore } from "src/stores/formBuilder";

const $q = useQuasar();
const formBuilderStore = useFormBuilderStore();
const fieldFormRef = ref();

const shouldShowOptions = computed(() => {
  const fieldType = formBuilderStore.currentField.field_type;
  return ["select", "radio", "checkbox"].includes(fieldType as string);
});

const handleSubmit = async () => {
  if (!fieldFormRef.value) return;

  const isValid = await fieldFormRef.value.validate();
  if (!isValid) return;

  const success = formBuilderStore.addOrUpdateField();

  if (success) {
    const message = formBuilderStore.isEditing
      ? "Field updated successfully"
      : "Field added successfully";

    if ($q?.notify) {
      $q.notify({
        type: "positive",
        message,
      });
    }
  } else {
    if ($q?.notify) {
      $q.notify({
        type: "negative",
        message: "Field key must be unique",
      });
    }
  }
};
</script>

<style scoped>
.dialog-card {
  width: 100%;
  max-width: 900px;
  height: 100vh;
  max-height: 100vh;
}

@media (min-width: 1024px) {
  .dialog-card {
    height: auto;
    max-height: 90vh;
  }
}
</style>
