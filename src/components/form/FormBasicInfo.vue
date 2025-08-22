<!-- components/form/FormBasicInfo.vue -->
<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">{{ title }}</div>

      <q-form @submit="handleSubmit">
        <div class="row q-gutter-md q-mb-md">
          <div class="col">
            <q-input
              v-model="formData.name"
              label="Form Name"
              outlined
              dense
              :rules="[(val) => !!val || 'Form name is required']"
            />
          </div>
          <div class="col-auto">
            <q-toggle
              v-model="formData.is_active"
              label="Active"
              color="primary"
            />
          </div>
        </div>

        <q-input
          v-model="formData.description"
          label="Form Description"
          type="textarea"
          outlined
          dense
          rows="2"
        />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useFormBuilderStore } from "src/stores/formBuilder";
import { Ref, ref } from "vue";

interface Props {
  title: string;
  // formRef: any;
  // onSubmit: () => Promise<void>; // parent-provided submit handler
}

const props = defineProps<Props>();

const formBuilderStore = useFormBuilderStore();
const { formData } = storeToRefs(formBuilderStore);

const formRef = ref();

const handleSubmit = () => {
  // This will be handled by the parent component
  // props.onSubmit();
  console.log("Form submitted");
};

const validate = async () => {
  if (!formRef.value) return false;
  return await formRef.value.validate();
};

defineExpose({
  validate,
});
</script>
