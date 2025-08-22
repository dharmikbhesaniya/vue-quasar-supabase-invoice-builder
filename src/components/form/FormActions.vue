<!-- components/form/FormActions.vue -->
<template>
  <div class="form-actions q-mt-lg">
    <!-- Field Count Info -->
    <div
      class="text-center q-mb-md text-grey-6"
      v-if="formBuilderStore.hasFields"
    >
      <q-icon name="info" size="sm" class="q-mr-xs" />
      {{ formBuilderStore.fieldCount }} field{{
        formBuilderStore.fieldCount > 1 ? "s" : ""
      }}
      added
    </div>

    <!-- Action Buttons -->
    <div class="row justify-center q-gutter-md">
      <q-btn
        flat
        label="Cancel"
        icon="arrow_back"
        @click="handleCancel"
        size="lg"
        class="q-px-xl"
        :disable="loading"
      />

      <q-btn
        color="primary"
        size="lg"
        :label="saveButtonText"
        :icon="saveButtonIcon"
        @click="handleSave"
        :loading="loading"
        :disable="!canSave"
        class="q-px-xl"
      >
        <q-tooltip v-if="!canSave && !loading">
          {{ getDisabledReason }}
        </q-tooltip>
      </q-btn>
    </div>

    <!-- Save Info -->
    <div class="text-center q-mt-md text-caption text-grey-6">
      {{
        isEditing
          ? "Changes will be saved to the existing form"
          : "A new form will be created"
      }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useFormBuilderStore } from "src/stores/formBuilder";

interface Props {
  isEditing?: boolean;
  loading?: boolean;
}

interface Emits {
  (e: "save"): void;
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
  loading: false,
});

const emit = defineEmits<Emits>();

const router = useRouter();
const $q = useQuasar();
const formBuilderStore = useFormBuilderStore();

const saveButtonText = computed(() =>
  props.isEditing ? "Update Form" : "Create Form"
);

const saveButtonIcon = computed(() => (props.isEditing ? "save" : "add"));

const canSave = computed(() => {
  return !!(
    formBuilderStore.formData.name?.trim() &&
    formBuilderStore.hasFields &&
    !props.loading
  );
});

const getDisabledReason = computed(() => {
  if (!formBuilderStore.formData.name?.trim()) {
    return "Form name is required";
  }
  if (!formBuilderStore.hasFields) {
    return "At least one field is required";
  }
  return "";
});

const handleSave = () => {
  if (!canSave.value) {
    $q.notify({
      type: "warning",
      message: getDisabledReason.value,
    });
    return;
  }

  emit("save");
};

const handleCancel = () => {
  // Show confirmation if form has unsaved changes
  if (formBuilderStore.formData.name || formBuilderStore.hasFields) {
    $q.dialog({
      title: "Discard Changes",
      message:
        "Are you sure you want to leave? All unsaved changes will be lost.",
      cancel: true,
      persistent: true,
    }).onOk(() => {
      formBuilderStore.clearForm();
      router.push("/forms");
    });
  } else {
    router.push("/forms");
  }
};
</script>

<style scoped>
.form-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding-top: 24px;
  margin-top: 32px;
}

.form-actions .q-btn {
  min-width: 140px;
}

@media (max-width: 600px) {
  .form-actions .row {
    flex-direction: column;
    align-items: center;
  }

  .form-actions .q-btn {
    width: 100%;
    max-width: 280px;
  }
}
</style>
