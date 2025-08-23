<!-- pages/FormsList.vue -->
<template>
  <q-page padding>
    <CustomHeader
      title="Custom Forms"
      subtitle="Manage your custom forms"
      button-label="Create Form"
      button-icon="add_circle"
      :on-button-click="goToCreateSurvey"
    />

    <!-- TODO: use there global filter component for search and filter -->
    <!-- Search and Filters -->
    <q-card flat class="q-mb-lg">
      <q-card-section>
        <div class="row q-gutter-md items-center">
          <div class="col-md-6 col-12">
            <q-input
              v-model="searchQuery"
              placeholder="Search forms..."
              outlined
              dense
              debounce="300"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-md-3 col-12">
            <q-select
              v-model="statusFilter"
              :options="statusOptions"
              label="Status"
              outlined
              dense
              emit-value
              map-options
              clearable
            />
          </div>
          <div class="col-md-3 col-12">
            <q-select
              v-model="sortBy"
              :options="sortOptions"
              label="Sort by"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Forms Grid/List -->
    <div v-if="loading" class="row justify-center q-py-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="filteredForms.length === 0" class="text-center q-py-xl">
      <q-icon name="description" size="64px" class="text-grey-4 q-mb-md" />
      <h6 class="text-grey-6 q-my-md">
        {{
          searchQuery
            ? "No forms found matching your search"
            : "No forms created yet"
        }}
      </h6>
      <q-btn
        v-if="!searchQuery"
        color="primary"
        label="Create Your First Form"
        @click="$router.push('/forms/create')"
        outline
      />
    </div>

    <div v-else class="row q-gutter-lg">
      <div
        v-for="(form, index) in filteredForms"
        :key="index"
        class="col-12 col-md-6 col-lg-4"
      >
        <!-- TODO: remove editForm on click and handel onclick with preview -->
        <q-card
          class="form-card cursor-pointer"
          :class="{ selected: selectedForm?.id === form.id }"
          @click="selectDefaultForm(form)"
        >
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <q-chip
                :color="form.is_active ? 'positive' : 'grey'"
                text-color="white"
                size="sm"
                :label="form.is_active ? 'Active' : 'Inactive'"
              />
              <q-btn-dropdown flat round icon="more_vert" @click.stop>
                <q-list>
                  <q-item clickable v-close-popup @click="editForm(form)">
                    <q-item-section avatar>
                      <q-icon name="edit" />
                    </q-item-section>
                    <q-item-section>Edit Form</q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="viewSubmissions(form)"
                  >
                    <q-item-section avatar>
                      <q-icon name="assignment" />
                    </q-item-section>
                    <q-item-section>View Submissions</q-item-section>
                  </q-item>

                  <q-item clickable v-close-popup @click="duplicateForm(form)">
                    <q-item-section avatar>
                      <q-icon name="content_copy" />
                    </q-item-section>
                    <q-item-section>Duplicate</q-item-section>
                  </q-item>

                  <q-separator />

                  <q-item
                    clickable
                    v-close-popup
                    @click="toggleFormStatus(form)"
                    :class="{
                      'text-positive': !form.is_active,
                      'text-orange': form.is_active,
                    }"
                  >
                    <q-item-section avatar>
                      <q-icon
                        :name="form.is_active ? 'visibility_off' : 'visibility'"
                      />
                    </q-item-section>
                    <q-item-section>
                      {{ form.is_active ? "Deactivate" : "Activate" }}
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="deleteForm(form)"
                    class="text-negative"
                  >
                    <q-item-section avatar>
                      <q-icon name="delete" />
                    </q-item-section>
                    <q-item-section>Delete</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>

            <h6 class="q-my-sm text-weight-medium">{{ form.name }}</h6>

            <p
              v-if="form.description"
              class="text-grey-6 text-caption q-mb-md line-clamp-2"
            >
              {{ form.description }}
            </p>

            <div class="row items-center text-caption text-grey-6 q-mb-md">
              <q-icon name="event" size="16px" class="q-mr-xs" />
              Created {{ formatDate(form.created_at) }}
            </div>

            <div class="row items-center justify-between">
              <div class="text-caption text-grey-6">
                <q-icon name="list_alt" size="16px" class="q-mr-xs" />
                {{ getFieldCount(form) }} fields
              </div>
              <div class="text-caption text-grey-6">
                <q-icon
                  name="assignment_turned_in"
                  size="16px"
                  class="q-mr-xs"
                />
                {{ getSubmissionCount(form) }} submissions
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="q-pt-none">
            <q-btn
              flat
              color="primary"
              label="Fill Form"
              @click.stop="fillForm(form)"
              class="full-width"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Quick Stats -->
    <q-card flat class="q-mt-xl">
      <q-card-section>
        <div class="text-h6 q-mb-md">Quick Stats</div>
        <div class="row q-gutter-lg">
          <div class="col-12 col-md-3">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-h4 text-primary">{{ totalForms }}</div>
                <div class="text-grey-6">Total Forms</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-h4 text-positive">{{ activeForms }}</div>
                <div class="text-grey-6">Active Forms</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-h4 text-info">{{ totalSubmissions }}</div>
                <div class="text-grey-6">Total Submissions</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-h4 text-orange">{{ recentSubmissions }}</div>
                <div class="text-grey-6">This Week</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useCustomFormStore } from "../stores/customFormStore";
import { date } from "quasar";
import CustomHeader from "src/components/ui/CustomHeader.vue";
import { CustomForm } from "src/types/form";

const router = useRouter();
const $q = useQuasar();
const formStore = useCustomFormStore();

// Reactive data
const searchQuery = ref("");
const statusFilter = ref<boolean | null>(null);
const sortBy = ref("created_at_desc");

// Computed
const loading = computed(() => formStore.loading);
const forms = computed(() => formStore.forms);

const selectedForm = computed(() => formStore.selectedForm);

const statusOptions = [
  { label: "Active", value: true },
  { label: "Inactive", value: false },
];

const sortOptions = [
  { label: "Newest First", value: "created_at_desc" },
  { label: "Oldest First", value: "created_at_asc" },
  { label: "Name A-Z", value: "name_asc" },
  { label: "Name Z-A", value: "name_desc" },
];

const filteredForms = computed(() => {
  let filtered = [...forms.value];

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (form) =>
        form.name.toLowerCase().includes(query) ||
        (form.description && form.description.toLowerCase().includes(query))
    );
  }

  // Status filter
  if (statusFilter.value !== null) {
    filtered = filtered.filter((form) => form.is_active === statusFilter.value);
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case "created_at_desc":
        return (
          new Date(b.created_at || "").getTime() -
          new Date(a.created_at || "").getTime()
        );
      case "created_at_asc":
        return (
          new Date(a.created_at || "").getTime() -
          new Date(b.created_at || "").getTime()
        );
      case "name_asc":
        return a.name.localeCompare(b.name);
      case "name_desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  return filtered;
});

const totalForms = computed(() => forms.value.length);
const activeForms = computed(
  () => forms.value.filter((form) => form.is_active).length
);
const totalSubmissions = computed(() => {
  // This would need to be implemented based on your submissions data
  return formStore.formSubmissions.length;
});
const recentSubmissions = computed(() => {
  // This would need to be implemented based on your submissions data
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return formStore.formSubmissions.filter(
    (submission) => new Date(submission.submitted_at || "") > oneWeekAgo
  ).length;
});

// Methods
const selectDefaultForm = (form: CustomForm) => {
  formStore.selectForm(form);
};

const goToCreateSurvey = () => {
  router.push("/forms/create");
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "Unknown";
  return date.formatDate(new Date(dateString), "MMM DD, YYYY");
};

const getFieldCount = (form: CustomForm) => {
  return form.fields?.length || 0;
};

const getSubmissionCount = (form: CustomForm) => {
  // This would need to be implemented based on your submissions data
  return formStore.formSubmissions.filter(
    (submission) => submission.form_id === form.id
  ).length;
};

const viewForm = (form: CustomForm) => {
  formStore.setCurrentForm(form);
  router.push(`/forms/${form.id}/view`);
};

const editForm = (form: CustomForm) => {
  router.push(`/forms/${form.id}/edit`);
};

const fillForm = (form: CustomForm) => {
  router.push(`/invoice/${form.id}`);
};

const viewSubmissions = (form: CustomForm) => {
  router.push(`/forms/${form.id}/submissions`);
};

const duplicateForm = async (form: CustomForm) => {
  try {
    const duplicatedForm = await formStore.createForm({
      name: `${form.name} (Copy)`,
      description: form.description || "",
      is_active: false,
    });

    // Copy fields if they exist
    if (form.fields && duplicatedForm.id) {
      for (const field of form.fields) {
        await formStore.createFormField({
          ...field,
          form_id: duplicatedForm.id,
          // id: undefined,
          // created_at: undefined
        });
      }
    }

    $q.notify({
      type: "positive",
      message: "Form duplicated successfully",
    });

    await formStore.fetchForms();
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Failed to duplicate form",
    });
  }
};

const toggleFormStatus = async (form: CustomForm) => {
  try {
    await formStore.updateForm(form.id!, { is_active: !form.is_active });
    $q.notify({
      type: "positive",
      message: `Form ${
        form.is_active ? "deactivated" : "activated"
      } successfully`,
    });
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Failed to update form status",
    });
  }
};

const deleteForm = (form: CustomForm) => {
  $q.dialog({
    title: "Confirm Delete",
    message: `Are you sure you want to delete "${form.name}"? This action cannot be undone and will also delete all associated submissions.`,
    cancel: true,
    persistent: true,
    color: "negative",
  }).onOk(async () => {
    try {
      await formStore.deleteForm(form.id!);
      $q.notify({
        type: "positive",
        message: "Form deleted successfully",
      });
    } catch (error) {
      $q.notify({
        type: "negative",
        message: "Failed to delete form",
      });
    }
  });
};

// Lifecycle
onMounted(async () => {
  await formStore.fetchForms();
});
</script>

<style scoped>
.selected {
  border-color: var(--q-primary);
  background-color: rgba(25, 118, 210, 0.05);
}

.form-card {
  transition: all 0.3s ease;
  border-radius: 12px;
}

.form-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
