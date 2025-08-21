<template>
  <q-dialog
    v-model="props.modelValue"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="preview-dialog">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Template Preview: {{ previewTemplate?.name }}</div>
        <q-space />
        <q-btn flat round icon="close" @click="$emit('close')" />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <slot />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Download"
          icon="download"
          @click="$emit('download')"
          color="primary"
        />
        <q-btn
          flat
          label="Use Template"
          icon="check"
          @click="$emit('use')"
          color="positive"
        />
        <q-btn flat label="Close" @click="$emit('close')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  previewTemplate: any;
}>();
</script>
