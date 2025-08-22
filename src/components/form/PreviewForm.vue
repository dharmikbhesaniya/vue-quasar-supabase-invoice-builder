<!-- components/LivePreviewCard.vue -->
<template>
  <div class="col-md-4 col-12">
    <q-card sticky>
      <q-card-section>
        <div class="text-h6">Live Preview</div>
        <q-separator class="q-my-md" />

        <!-- Empty state -->
        <div v-if="fields.length === 0" class="text-center text-grey-6 q-py-xl">
          <q-icon name="preview" size="32px" class="q-mb-md" />
          <div>Add fields to see preview</div>
        </div>

        <!-- Renderer -->
        <CustomFormRenderer v-else :fields="fields" preview-mode />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import CustomFormRenderer from "./CustomFormRenderer.vue";

defineProps({
  fields: {
    type: Array,
    default: () => [],
  },
});
</script>
