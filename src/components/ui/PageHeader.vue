<!-- src/components/PageHeader.vue -->
<template>
  <div class="row justify-between items-center q-mb-md">
    <div>
      <div class="text-h6">{{ title }}</div>
      <div class="text-caption text-grey" v-if="subtitle">{{ subtitle }}</div>
    </div>
    <div class="row items-center q-gutter-sm">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>
