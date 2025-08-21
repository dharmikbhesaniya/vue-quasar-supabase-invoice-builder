<template>
  <div class="row justify-between items-center q-mb-md">
    <div class="text-h6">{{ title }}</div>
    <div class="row items-center gap-2">
      <slot name="info" />
      <q-btn
        v-if="showButton"
        :label="buttonLabel"
        :icon="buttonIcon"
        :color="buttonColor"
        size="sm"
        @click="$emit('button-click')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: String,
  showButton: Boolean,
  buttonLabel: String,
  buttonIcon: String,
  buttonColor: {
    type: String,
    default: "primary",
  },
});
</script>
