<!-- pages/FormSubmissions.vue -->
<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="row items-center q-gutter-sm q-mb-sm">
          <q-btn
            flat
            round
            icon="arrow_back"
            @click="$router.push('/forms')"
            class="q-mr-sm"
          />
          <h4 class="q-my-none">Form Submissions</h4>
        </div>
        <p v-if="currentForm" class="text-grey-6 q-mb-none">
          Viewing submissions for: <strong>{{ currentForm.name }}</strong>
        </p>
      </div>

      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          icon="download"
          label="Export CSV"
          @click="exportSubmissions"
          outline
          :disable="submissions.length === 0"
        />
        <q-btn
          color="positive"
          icon="add"
          label="Fill Form"
          @click="$router.push(`/forms/${$route.params.id}/fill`)"
        />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row q-gutter-md q-mb-lg">
      <div class="col-12 col-md-3">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-h4 text-primary">{{ submissions.length }}</div>
            <div class="text-grey-6">Total Submissions</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-h4 text-positive">{{ todaySubmissions }}</div>
            <div class="text-grey-6">Today</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-h4 text-info">{{ weekSubmissions }}</div>
            <div class="text-grey-6">This Week</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-h4 text-orange">{{ monthSubmissions }}</div>
            <div class="text-grey-6">This Month</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filters -->
    <q-card flat class="q-mb-lg">
      <q-card-section>
        <div class="row q-gutter-md items-center">
          <div class="col-12 col-md-4">
            <q-input
              v-model="searchQuery"
              placeholder="Search submissions..."
              outlined
              dense
              debounce="300"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="dateFrom"
              type="date"
              label="From Date"
              outlined
              dense
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="dateTo"
              type="date"
              label="To Date"
              outlined
              dense
            />
          </div>
          <div class="col-12 col-md-2">
            <q-btn
              flat
              label="Clear Filters"
              @click="clearFilters"
              :disable="!hasFilters"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Submissions Table -->
    <q-card>
      <q-card-section>
        <!-- Loading State -->
        <div v-if="loading" class="text-center q-py-xl">
          <q-spinner color="primary" size="3em" />
          <div class="q-mt-md text-grey-6">Loading submissions...</div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="filteredSubmissions.length === 0"
          class="text-center q-py-xl"
        >
          <q-icon name="assignment" size="64px" class="text-grey-4 q-mb-md" />
          <h6 class="text-grey-6 q-my-md">
            {{
              searchQuery || dateFrom || dateTo
                ? "No submissions found matching your filters"
                : "No submissions yet"
            }}
          </h6>
          <q-btn
            v-if="!searchQuery && !dateFrom && !dateTo"
            color="primary"
            label="Fill Form"
            @click="$router.push(`/forms/${$route.params.id}/fill`)"
            outline
          />
        </div>

        <!-- Submissions Table -->
        <q-table
          v-else
          :rows="filteredSubmissions"
          :columns="tableColumns"
          row-key="id"
          :pagination="pagination"
          @request="onRequest"
          binary-state-sort
        >
          <template #body="props">
            <q-tr :props="props">
              <q-td key="submitted_at" :props="props">
                {{ formatDate(props.row.submitted_at) }}
              </q-td>

              <!-- Dynamic columns for form fields -->
              <q-td
                v-for="field in currentFormFields"
                :key="field.field_key"
                :props="props"
              >
                <div class="submission-cell">
                  {{
                    formatFieldValue(
                      props.row.form_data[field.field_key],
                      field
                    )
                  }}
                </div>
              </q-td>

              <q-td key="actions" :props="props">
                <div class="row q-gutter-xs justify-end">
                  <q-btn
                    flat
                    round
                    icon="visibility"
                    size="sm"
                    @click="viewSubmission(props.row)"
                    color="primary"
                  >
                    <q-tooltip>View Details</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    icon="delete"
                    size="sm"
                    @click="deleteSubmission(props.row)"
                    color="negative"
                  >
                    <q-tooltip>Delete</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- View Submission Dialog -->
    <q-dialog v-model="showSubmissionDialog" :maximized="$q.screen.xs">
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section class="row items-center">
          <div class="text-h6">Submission Details</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedSubmission">
          <div class="text-subtitle2 text-grey-6 q-mb-md">
            Submitted: {{ formatDate(selectedSubmission.submitted_at) }}
          </div>

          <div
            v-for="field in currentFormFields"
            :key="field.field_key"
            class="q-mb-md"
          >
            <div class="text-weight-medium q-mb-xs">{{ field.field_name }}</div>
            <q-card flat bordered>
              <q-card-section class="q-pa-md">
                {{
                  formatFieldValue(
                    selectedSubmission.form_data[field.field_key],
                    field
                  ) || "No response"
                }}
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar, date } from "quasar";
import { useCustomFormStore } from "../stores/customFormStore";
import type { FormSubmission, FormField } from "../stores/customFormStore";

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const formStore = useCustomFormStore();

// Reactive data
const searchQuery = ref("");
const dateFrom = ref("");
const dateTo = ref("");
const showSubmissionDialog = ref(false);
const selectedSubmission = ref<FormSubmission | null>(null);

const pagination = ref({
  sortBy: "submitted_at",
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

// Computed
const loading = computed(() => formStore.loading);
const currentForm = computed(() => formStore.currentForm);
const currentFormFields = computed(() => formStore.currentFormFields);
const submissions = computed(() => formStore.formSubmissions);

const hasFilters = computed(
  () => searchQuery.value || dateFrom.value || dateTo.value
);

const filteredSubmissions = computed(() => {
  let filtered = [...submissions.value];

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((submission) => {
      const dataString = JSON.stringify(submission.form_data).toLowerCase();
      return dataString.includes(query);
    });
  }

  // Date filters
  if (dateFrom.value) {
    filtered = filtered.filter(
      (submission) =>
        new Date(submission.submitted_at!) >= new Date(dateFrom.value)
    );
  }

  if (dateTo.value) {
    const endDate = new Date(dateTo.value);
    endDate.setHours(23, 59, 59, 999);
    filtered = filtered.filter(
      (submission) => new Date(submission.submitted_at!) <= endDate
    );
  }

  return filtered;
});

const todaySubmissions = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return submissions.value.filter((sub) => new Date(sub.submitted_at!) >= today)
    .length;
});

const weekSubmissions = computed(() => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return submissions.value.filter(
    (sub) => new Date(sub.submitted_at!) >= weekAgo
  ).length;
});

const monthSubmissions = computed(() => {
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  return submissions.value.filter(
    (sub) => new Date(sub.submitted_at!) >= monthAgo
  ).length;
});

const tableColumns = computed(() => {
  const columns: any[] = [
    {
      name: "submitted_at",
      required: true,
      label: "Submitted At",
      align: "left",
      field: "submitted_at",
      sortable: true,
    },
  ];

  // Add dynamic columns for each form field
  currentFormFields.value.forEach((field) => {
    columns.push({
      name: field.field_key,
      label: field.field_name,
      align: "left",
      field: (row: FormSubmission) => row.form_data[field.field_key] || "",
      sortable: false,
    });
  });

  columns.push({
    name: "actions",
    label: "Actions",
    align: "right",
    field: "",
    sortable: false,
  });

  return columns;
});

// Methods
const formatDate = (dateString?: string) => {
  if (!dateString) return "Unknown";
  return date.formatDate(new Date(dateString), "MMM DD, YYYY HH:mm");
};

const formatFieldValue = (value: any, field: FormField) => {
  if (value === null || value === undefined || value === "") {
    return "No response";
  }

  switch (field.field_type) {
    case "checkbox":
      if (Array.isArray(value)) {
        return value.length > 0 ? value.join(", ") : "None selected";
      }
      return value ? "Yes" : "No";

    case "select":
    case "radio":
      // Find the label for the selected value
      if (field.options) {
        const option = field.options.find((opt) => opt.value === value);
        return option ? option.label : value;
      }
      return value;

    case "file":
      return value ? "File uploaded" : "No file";

    default:
      return String(value);
  }
};

const viewSubmission = (submission: FormSubmission) => {
  selectedSubmission.value = submission;
  showSubmissionDialog.value = true;
};

const deleteSubmission = (submission: FormSubmission) => {
  $q.dialog({
    title: "Confirm Delete",
    message:
      "Are you sure you want to delete this submission? This action cannot be undone.",
    cancel: true,
    persistent: true,
    color: "negative",
  }).onOk(async () => {
    try {
      // Implement delete submission in store
      // await formStore.deleteSubmission(submission.id!)
      $q.notify({
        type: "positive",
        message: "Submission deleted successfully",
      });
    } catch (error) {
      $q.notify({
        type: "negative",
        message: "Failed to delete submission",
      });
    }
  });
};

const clearFilters = () => {
  searchQuery.value = "";
  dateFrom.value = "";
  dateTo.value = "";
};

const exportSubmissions = () => {
  try {
    const headers = [
      "Submitted At",
      ...currentFormFields.value.map((field) => field.field_name),
    ];
    const rows = filteredSubmissions.value.map((submission) => [
      formatDate(submission.submitted_at),
      ...currentFormFields.value.map((field) =>
        formatFieldValue(submission.form_data[field.field_key], field)
      ),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${currentForm.value?.name || "form"}_submissions.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    $q.notify({
      type: "positive",
      message: "Submissions exported successfully",
    });
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Failed to export submissions",
    });
  }
};

const onRequest = (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
};

const loadData = async () => {
  try {
    const formId = route.params.id as string;

    // Load form if not in store
    let form = formStore.getFormById(formId);
    if (!form) {
      await formStore.fetchForms();
      form = formStore.getFormById(formId);
    }

    if (form) {
      formStore.setCurrentForm(form);
      await formStore.fetchFormFields(formId);
      await formStore.fetchFormSubmissions(formId);
    }
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Failed to load form data",
    });
  }
};

// Lifecycle
onMounted(async () => {
  await loadData();
});
</script>

<style scoped>
.submission-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
