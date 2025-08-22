import { defineStore } from "pinia";
import { ref } from "vue";
import { FormField } from "./customFormStore";

export const useCustomFormStore = defineStore("formBuilder", () => {
  const formFields = ref<FormField[]>([]);

  return {
    formFields,
  };
});
