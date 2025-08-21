<template>
  <!-- :to="computedRoute" -->
  <!-- @keyup.enter="$router.push(props.routeName)" -->
  <q-item
    :tag="tag"
    clickable
    v-ripple
    active-class="text-primary"
    role="link"
    tabindex="0"
    @click="$router.push({ name: props.routeName })"
    :aria-label="ariaLabel"
  >
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label v-if="caption" caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { EssentialLinkProps } from "src/types/sidbare";
import { computed } from "vue";
import { useRouter } from "vue-router";

const props = withDefaults(defineProps<EssentialLinkProps>(), {
  caption: "",
  icon: "",
  routeName: "",
  routeParams: () => ({}),
  tag: "a",
});

const router = useRouter();

const ariaLabel = computed(() => {
  return props.caption ? `${props.title}, ${props.caption}` : props.title;
});
</script>
