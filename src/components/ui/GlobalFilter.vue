<template>
  <div class="q-gutter-sm row items-center wrap">
    <!-- Search Field -->
    <q-input
      dense
      outlined
      debounce="300"
      v-model="searchQuery"
      placeholder="Search..."
      clearable
      @update:model-value="emitFilters"
      class="filter-input"
    >
      <template #prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <!-- Optional Select Dropdown -->
    <q-select
      v-if="selectOptions.length"
      dense
      outlined
      v-model="selectedOption"
      :options="selectOptions"
      :label="selectLabel"
      clearable
      emit-value
      map-options
      @update:model-value="emitFilters"
    />

    <!-- 🔽 Slot for custom filter fields -->
    <slot />

    <!-- Reset Button -->
    <q-btn
      v-if="showReset"
      dense
      flat
      icon="close"
      @click="resetFilters"
      title="Reset filters"
    />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

defineOptions({ name: "GlobalFilter" });

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  selectOptions: {
    type: Array,
    default: () => [],
  },
  selectLabel: {
    type: String,
    default: "Filter",
  },
  showReset: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const searchQuery = ref(props.modelValue.search || "");
const selectedOption = ref(props.modelValue.option || null);

// Emit updated filters
function emitFilters() {
  emit("update:modelValue", {
    ...props.modelValue, // keep any extra fields (like from slots)
    search: searchQuery.value,
    option: selectedOption.value,
  });
}

// Reset filters
function resetFilters() {
  searchQuery.value = "";
  selectedOption.value = null;
  emitFilters();
}

// Sync with parent changes
watch(
  () => props.modelValue,
  (newVal) => {
    searchQuery.value = newVal.search || "";
    selectedOption.value = newVal.option || null;
  }
);
</script>

<style scoped>
.filter-input {
  min-width: 200px;
}
</style>
