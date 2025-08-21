<template>
  <q-card
    class="template-card cursor-pointer"
    :class="{ selected }"
    @click="$emit('select', template)"
  >
    <q-card-section class="text-center relative-position">
      <q-icon
        :name="template.template_type === 'vue' ? 'code' : 'article'"
        size="48px"
        :color="template.template_type === 'vue' ? 'positive' : 'secondary'"
      />
      <div class="text-subtitle2 q-mt-sm">{{ template.name }}</div>
      <div class="text-caption text-grey-6">
        {{ new Date(template.created_at).toLocaleDateString() }}
      </div>
      <div class="text-caption text-primary q-mt-xs">
        {{ template.template_type.toUpperCase() }} Template
      </div>

      <q-btn
        flat
        round
        icon="more_vert"
        size="sm"
        class="absolute-top-right"
        @click.stop
      >
        <q-menu>
          <q-list>
            <q-item clickable @click="$emit('preview', template)">
              <q-item-section avatar
                ><q-icon name="visibility"
              /></q-item-section>
              <q-item-section
                ><q-item-label>Preview</q-item-label></q-item-section
              >
            </q-item>
            <q-item clickable @click="$emit('download', template)">
              <q-item-section avatar><q-icon name="download" /></q-item-section>
              <q-item-section
                ><q-item-label>Download</q-item-label></q-item-section
              >
            </q-item>
            <q-separator />
            <q-item clickable @click="$emit('delete', template)">
              <q-item-section avatar
                ><q-icon name="delete" color="negative"
              /></q-item-section>
              <q-item-section
                ><q-item-label class="text-negative"
                  >Delete</q-item-label
                ></q-item-section
              >
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import type { InvoiceTemplate } from "src/types/invoice";

defineProps<{
  template: InvoiceTemplate;
  selected: boolean;
}>();
</script>
