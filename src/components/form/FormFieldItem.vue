<!-- components/form/FormFieldItem.vue -->
<template>
  <q-card
    flat
    bordered
    class="field-card q-mb-sm"
    :class="{ 'bg-blue-1': isEditing }"
  >
    <q-card-section class="row items-center q-pa-md">
      <!-- Drag Handle -->
      <q-icon
        name="drag_indicator"
        class="drag-handle cursor-pointer q-mr-sm text-grey-6"
      />

      <!-- Field Info -->
      <div class="col">
        <div class="row items-center q-gutter-sm">
          <q-chip
            :icon="getFieldTypeIcon(field.field_type)"
            :label="field.field_type"
            size="sm"
            color="primary"
            outline
          />
          <span class="text-weight-medium text-body1">
            {{ field.field_name }}
          </span>
          <q-badge v-if="field.is_required" color="orange" label="Required" />
        </div>

        <div class="text-caption text-grey-6 q-mt-xs">
          Key: {{ field.field_key }}
        </div>

        <div v-if="field.placeholder" class="text-caption text-grey-6">
          Placeholder: {{ field.placeholder }}
        </div>

        <!-- Field Options Preview -->
        <div
          v-if="field.options && field.options.length > 0"
          class="text-caption text-grey-6 q-mt-xs"
        >
          Options: {{ field.options.map((opt) => opt.label).join(", ") }}
        </div>

        <!-- Validation Rules Preview -->
        <div
          v-if="field.validation_rules && field.validation_rules.length > 0"
          class="text-caption text-grey-6 q-mt-xs"
        >
          <q-chip
            v-for="rule in field.validation_rules"
            :key="rule.type"
            size="xs"
            color="grey-4"
            :label="rule.type"
            class="q-mr-xs"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="row q-gutter-xs">
        <q-btn
          flat
          round
          icon="edit"
          size="sm"
          @click="$emit('edit')"
          color="primary"
        >
          <q-tooltip>Edit field</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          icon="delete"
          size="sm"
          @click="$emit('delete')"
          color="negative"
        >
          <q-tooltip>Delete field</q-tooltip>
        </q-btn>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { FormField } from "src/types/form";
import { getFieldTypeIcon } from "src/utils/form";

interface Props {
  field: FormField;
  index: number;
  isEditing?: boolean;
}

interface Emits {
  (e: "edit"): void;
  (e: "delete"): void;
}

defineProps<Props>();
defineEmits<Emits>();
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
