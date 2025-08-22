<template>
  <div class="row items-center justify-between q-mb-lg">
    <!-- Title and Subtitle -->
    <div class="row items-center gap-2">
      <q-btn
        v-if="backBtn"
        flat
        round
        icon="arrow_back"
        @click="$router.back()"
        class="q-mr-sm"
      />
      <div>
        <h4 class="q-my-none">{{ title }}</h4>
        <p class="text-grey-6 q-mb-none">
          {{ subtitle }}
        </p>
      </div>
    </div>

    <!-- Actions (Slot + Button) -->
    <div class="row items-center q-gutter-sm">
      <!-- Named Slot for custom actions -->
      <slot />

      <!-- Optional Button -->
      <q-btn
        v-if="onButtonClick && buttonLabel"
        :color="buttonColor"
        :icon="buttonIcon"
        :label="buttonLabel"
        :size="buttonSize"
        @click="onButtonClick"
      />
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "CustomHeader" });

defineProps({
  backBtn: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Custom Forms",
  },
  subtitle: {
    type: String,
    default: "Manage your custom forms and view submissions",
  },
  buttonLabel: {
    type: String,
    default: "Create Form",
  },
  buttonIcon: {
    type: String,
    default: "create",
  },
  buttonColor: {
    type: String,
    default: "primary",
  },
  buttonSize: {
    type: String,
    default: "lg",
  },
  onButtonClick: {
    type: Function,
    default: null,
  },
});
</script>
