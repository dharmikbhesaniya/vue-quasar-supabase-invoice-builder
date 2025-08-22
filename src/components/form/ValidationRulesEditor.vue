<!-- components/form/ValidationRulesEditor.vue -->
<template>
  <div class="validation-rules-editor">
    <div class="text-subtitle2 q-mb-md">Validation Rules</div>

    <div v-if="rules.length === 0" class="text-grey-6 text-center q-py-md">
      <q-icon name="rule" size="md" class="q-mb-sm" />
      <div>No validation rules added yet</div>
    </div>

    <div v-else class="q-gutter-sm">
      <q-card
        v-for="(rule, index) in rules"
        :key="`rule-${index}`"
        flat
        bordered
        class="rule-item"
      >
        <q-card-section class="q-pa-sm">
          <div class="row q-gutter-sm items-center">
            <!-- Rule Type -->
            <div class="col-md-3 col-12">
              <q-select
                v-model="rule.type"
                :options="validationTypeOptions"
                label="Rule Type"
                outlined
                dense
                emit-value
                map-options
              />
            </div>

            <!-- Rule Value (for min/max/pattern) -->
            <div
              v-if="['min', 'max'].includes(rule.type)"
              class="col-md-3 col-12"
            >
              <q-input
                v-model.number="rule.value"
                type="number"
                label="Value"
                outlined
                dense
              />
            </div>

            <div
              v-else-if="rule.type === 'pattern'"
              class="col-md-3 col-12"
            >
              <q-input
                v-model="rule.value"
                label="Pattern (RegEx)"
                outlined
                dense
                placeholder="^[a-zA-Z]+$"
              />
            </div>

            <!-- Error Message -->
            <div class="col">
              <q-input
                v-model="rule.message"
                label="Error Message"
                outlined
                dense
                placeholder="Custom error message"
              />
            </div>

            <!-- Remove Button -->
            <div class="col-auto">
              <q-btn
                flat
                round
                icon="delete"
                size="sm"
                @click="$emit('remove', index)"
                color="negative"
              >
                <q-tooltip>Remove rule</q-tooltip>
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
        label="Add Validation Rule"
        @click="$emit('add')"
        color="primary"
        size="sm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ValidationRule } from 'src/types/form'
import { validationTypeOptions } from 'src/constants/form'

interface Props {
  rules: ValidationRule[]
}

interface Emits {
  (e: 'add'): void
  (e: 'remove', index: number): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.rule-item {
  transition: all 0.2s ease;
}

.rule-item:hover {
  border-color: var(--q-primary);
}
</style>
