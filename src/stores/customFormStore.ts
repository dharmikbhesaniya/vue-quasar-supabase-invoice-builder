// stores/customFormStore.ts
import { defineStore } from "pinia";
import { supabase } from "src/boot/supabase";
import { ref, computed } from "vue";

export interface ValidationRule {
  type: "required" | "email" | "min" | "max" | "pattern";
  value?: string | number;
  message: string;
}

export interface FormField {
  id?: string;
  form_id?: string;
  field_name: string;
  field_key: string;
  field_type:
    | "text"
    | "email"
    | "number"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "date"
    | "file";
  validation_rules?: ValidationRule[];
  options?: { label: string; value: string | number }[];
  placeholder?: string;
  is_required: boolean;
  sort_order: number;
  created_at?: string;
}

export interface CustomForm {
  id?: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  fields?: FormField[];
}

export interface FormSubmission {
  id?: string;
  form_id: string;
  form_data: Record<string, any>;
  submitted_at?: string;
  submitted_by?: string;
}

export const useCustomFormStore = defineStore("customForm", () => {
  // State
  const forms = ref<CustomForm[]>([]);
  const currentForm = ref<CustomForm | null>(null);
  const currentFormFields = ref<FormField[]>([]);
  const formSubmissions = ref<FormSubmission[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const activeforms = computed(() =>
    forms.value.filter((form) => form.is_active)
  );

  // Actions
  const setError = (err: string | null) => {
    error.value = err;
  };

  const setLoading = (state: boolean) => {
    loading.value = state;
  };

  // Form CRUD Operations
  const fetchForms = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("custom_forms")
        .select(
          `
          *,
          form_fields (*)
        `
        )
        .order("created_at", { ascending: false });

      if (supabaseError) throw supabaseError;

      forms.value = data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch forms");
    } finally {
      setLoading(false);
    }
  };

  const createForm = async (
    form: Omit<CustomForm, "id" | "created_at" | "updated_at">
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Ensure description is not undefined
      const formData = {
        ...form,
        description: form.description || null,
      };

      const { data, error: supabaseError } = await supabase
        .from("custom_forms")
        .insert([formData])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      forms.value.unshift(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create form");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateForm = async (id: string, updates: Partial<CustomForm>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("custom_forms")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      const index = forms.value.findIndex((form) => form.id === id);
      if (index !== -1) {
        forms.value[index] = data;
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update form");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: supabaseError } = await supabase
        .from("custom_forms")
        .delete()
        .eq("id", id);

      if (supabaseError) throw supabaseError;

      forms.value = forms.value.filter((form) => form.id !== id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete form");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Form Fields Operations
  const createFormField = async (
    field: Omit<FormField, "id" | "created_at">
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("form_fields")
        .insert([field])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      currentFormFields.value.push(data);
      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create form field"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateFormField = async (id: string, updates: Partial<FormField>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("form_fields")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      const index = currentFormFields.value.findIndex(
        (field) => field.id === id
      );
      if (index !== -1) {
        currentFormFields.value[index] = data;
      }

      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update form field"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteFormField = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: supabaseError } = await supabase
        .from("form_fields")
        .delete()
        .eq("id", id);

      if (supabaseError) throw supabaseError;

      currentFormFields.value = currentFormFields.value.filter(
        (field) => field.id !== id
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete form field"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchFormFields = async (formId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("form_fields")
        .select("*")
        .eq("form_id", formId)
        .order("sort_order", { ascending: true });

      if (supabaseError) throw supabaseError;

      currentFormFields.value = data || [];
      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch form fields"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Form Submission Operations
  const submitForm = async (formId: string, formData: Record<string, any>) => {
    try {
      setLoading(true);
      setError(null);

      const submission: Omit<FormSubmission, "id" | "submitted_at"> = {
        form_id: formId,
        form_data: formData,
      };

      const { data, error: supabaseError } = await supabase
        .from("form_submissions")
        .insert([submission])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit form");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchFormSubmissions = async (formId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("form_submissions")
        .select("*")
        .eq("form_id", formId)
        .order("submitted_at", { ascending: false });

      if (supabaseError) throw supabaseError;

      formSubmissions.value = data || [];
      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch form submissions"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const getFormById = (id: string) => {
    return forms.value.find((form) => form.id === id);
  };

  const setCurrentForm = (form: CustomForm | null) => {
    currentForm.value = form;
    if (form?.id) {
      fetchFormFields(form.id);
    } else {
      currentFormFields.value = [];
    }
  };

  const resetStore = () => {
    forms.value = [];
    currentForm.value = null;
    currentFormFields.value = [];
    formSubmissions.value = [];
    error.value = null;
    loading.value = false;
  };

  return {
    // State
    forms,
    currentForm,
    currentFormFields,
    formSubmissions,
    loading,
    error,

    // Getters
    activeforms,

    // Actions
    fetchForms,
    createForm,
    updateForm,
    deleteForm,
    createFormField,
    updateFormField,
    deleteFormField,
    fetchFormFields,
    submitForm,
    fetchFormSubmissions,
    getFormById,
    setCurrentForm,
    resetStore,
    setError,
    setLoading,
  };
});
