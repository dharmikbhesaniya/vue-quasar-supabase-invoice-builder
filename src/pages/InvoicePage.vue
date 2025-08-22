<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <!-- Left Panel - Form -->
      <div class="col-12 col-md-6">
        <InvoiceForm />

        <div class="q-mt-md">
          <TemplateSelector />
        </div>

        <div class="q-mt-md text-center">
          <q-btn
            color="primary"
            label="Save Invoice"
            icon="save"
            @click="saveInvoice"
            :loading="saving"
            class="q-mr-sm"
          />
          <q-btn
            color="secondary"
            label="Reset"
            icon="refresh"
            @click="resetInvoice"
          />
        </div>
      </div>

      <!-- Right Panel - Preview -->
      <div class="col-12 col-md-6">
        <InvoicePreview />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";
import TemplateSelector from "src/components/template/TemplateSelector.vue";
// import InvoiceForm from "src/components/InvoiceForm.vue";
// import InvoicePreview from "src/components/InvoicePreview.vue";
import { useInvoiceStore } from "src/stores/invoice";
import { useTemplateStore } from "src/stores/template";
import { onMounted, ref } from "vue";

const $q = useQuasar();
const invoiceStore = useInvoiceStore();
const templateStore = useTemplateStore();

const saving = ref(false);

const saveInvoice = async () => {
  saving.value = true;
  try {
    // await invoiceStore.saveInvoice();
    $q.notify({
      type: "positive",
      message: "Invoice saved successfully!",
    });
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Error saving invoice",
    });
  } finally {
    saving.value = false;
  }
};

const resetInvoice = () => {
  // invoiceStore.resetCurrentInvoice();
  $q.notify({
    type: "info",
    message: "Invoice reset",
  });
};

onMounted(async () => {
  await Promise.all([
    templateStore.loadTemplates(),
    // invoiceStore.loadInvoices(),
  ]);
});
</script>
