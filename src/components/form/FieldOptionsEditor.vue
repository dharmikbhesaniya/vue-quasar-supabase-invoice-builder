<!-- components/form/FieldOptionsEditor.vue -->
<template>
  <div class="field-options-editor">
    <div class="text-subtitle2 q-mb-md">Field Options</div>

    <div v-if="options.length === 0" class="text-grey-6 text-center q-py-md">
      <q-icon name="list_alt" size="md" class="q-mb-sm" />
      <div>No options added yet</div>
    </div>

    <div v-else class="q-gutter-sm">
      <q-card
        v-for="(option, index) in options"
        :key="`option-${index}`"
        flat
        bordered
        class="option-item"
      >
        <q-card-section class="q-pa-sm">
          <div class="row q-gutter-sm items-center">
            <div class="col">
              <q-input
                v-model="option.label"
                label="Display Label"
                outlined
                dense
                placeholder="e.g., Yes, No, Maybe"
              />
            </div>
            <div class="col">
              <q-input
                v-model="option.value"
                label="Value"
                outlined
                dense
                placeholder="e.g., yes, no, maybe"
              />
            </div>
            <div class="col-auto">
              <q-btn
                flat
                round
                icon="delete"
                size="sm"
                @click="$emit('remove', index)"
                color="negative"
              >
                <q-tooltip>Remove option</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="row justify-center q-mt-md">
      <q-btn
        flat
        icon="add"
        label="Add Option"
        @click="$emit('add')"
        color="primary"
        size="sm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { FormFieldOptions } from "src/types/form";

interface Props {
  options: FormFieldOptions[];
}

interface Emits {
  (e: "add"): void;
  (e: "remove", index: number): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<style scoped>
.option-item {
  transition: all 0.2s ease;
}

.option-item:hover {
  border-color: var(--q-primary);
}
</style>
