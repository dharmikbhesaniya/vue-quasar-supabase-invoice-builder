// stores/formBuilderStore.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { FormField, CustomForm } from "src/types/form";

export const useFormBuilderStore = defineStore("formBuilder", () => {
  // State
  const formData = ref<Partial<CustomForm>>({
    name: "",
    description: "",
    is_active: true,
  });

  const formFields = ref<FormField[]>([]);
  const currentField = ref<Partial<FormField>>({
    field_name: "",
    field_key: "",
    field_type: "text",
    placeholder: "",
    is_required: false,
    options: [],
    validation_rules: [],
    sort_order: 0,
  });

  const showAddFieldDialog = ref(false);
  const editingField = ref<FormField | null>(null);
  const isLoading = ref(false);

  // Getters
  const isEditing = computed(() => !!editingField.value);
  const fieldCount = computed(() => formFields.value.length);
  const hasFields = computed(() => formFields.value.length > 0);

  // Actions
  const setFormData = (data: Partial<CustomForm>) => {
    Object.assign(formData.value, data);
  };

  const setFormFields = (fields: FormField[]) => {
    formFields.value = [...fields];
  };

  const resetCurrentField = () => {
    Object.assign(currentField.value, {
      field_name: "",
      field_key: "",
      field_type: "text",
      placeholder: "",
      is_required: false,
      options: [],
      validation_rules: [],
      sort_order: formFields.value.length,
    });
  };

  const openAddFieldDialog = () => {
    resetCurrentField();
    editingField.value = null;
    showAddFieldDialog.value = true;
  };

  const openEditFieldDialog = (field: FormField) => {
    editingField.value = field;
    // Deep copy the field to avoid direct mutation
    Object.assign(currentField.value, {
      ...field,
      options: field.options ? JSON.parse(JSON.stringify(field.options)) : [],
      validation_rules: field.validation_rules
        ? JSON.parse(JSON.stringify(field.validation_rules))
        : [],
    });
    showAddFieldDialog.value = true;
  };

  const closeFieldDialog = () => {
    showAddFieldDialog.value = false;
    editingField.value = null;
    resetCurrentField();
  };

  const validateFieldKey = (key: string): boolean => {
    if (!key) return false;

    // Check for duplicate field keys (excluding current field if editing)
    const existingFieldIndex = formFields.value.findIndex(
      (f) => f.field_key === key && f !== editingField.value
    );

    return existingFieldIndex === -1;
  };

  const addOrUpdateField = (): boolean => {
    if (!currentField.value.field_name || !currentField.value.field_key) {
      return false;
    }

    if (!validateFieldKey(currentField.value.field_key)) {
      return false;
    }

    // Create a clean field object
    const fieldData: FormField = {
      field_name: currentField.value.field_name!,
      field_key: currentField.value.field_key!,
      field_type: currentField.value.field_type!,
      placeholder: currentField.value.placeholder || "",
      is_required: currentField.value.is_required || false,
      options: currentField.value.options
        ? JSON.parse(JSON.stringify(currentField.value.options))
        : [],
      validation_rules: currentField.value.validation_rules
        ? JSON.parse(JSON.stringify(currentField.value.validation_rules))
        : [],
      sort_order: currentField.value.sort_order || formFields.value.length,
    } as FormField;

    if (editingField.value) {
      // Update existing field
      const index = formFields.value.findIndex(
        (f) => f.field_key === editingField.value!.field_key
      );
      if (index !== -1) {
        // Preserve the original field's metadata if it exists
        formFields.value[index] = {
          ...fieldData,
          id: editingField.value.id,
          form_id: editingField.value.form_id,
          created_at: editingField.value.created_at,
        } as FormField;
      }
    } else {
      // Add new field
      formFields.value.push(fieldData);
    }

    updateFieldsOrder();
    closeFieldDialog();
    return true;
  };

  const deleteField = (index: number) => {
    formFields.value.splice(index, 1);
    updateFieldsOrder();
  };

  const moveField = (fromIndex: number, toIndex: number) => {
    const field = formFields.value.splice(fromIndex, 1)[0];
    formFields.value.splice(toIndex, 0, field as FormField);
    updateFieldsOrder();
  };

  const updateFieldsOrder = () => {
    formFields.value.forEach((field, index) => {
      field.sort_order = index;
    });
  };

  const addOption = () => {
    if (!currentField.value.options) currentField.value.options = [];
    currentField.value.options.push({ label: "", value: "" });
  };

  const removeOption = (index: number) => {
    currentField.value.options?.splice(index, 1);
  };

  const addValidationRule = () => {
    if (!currentField.value.validation_rules)
      currentField.value.validation_rules = [];
    currentField.value.validation_rules.push({ type: "required", message: "" });
  };

  const removeValidationRule = (index: number) => {
    currentField.value.validation_rules?.splice(index, 1);
  };

  const clearForm = () => {
    formData.value = {
      name: "",
      description: "",
      is_active: true,
    };
    formFields.value = [];
    resetCurrentField();
    closeFieldDialog();
  };

  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  return {
    // State
    formData,
    formFields,
    currentField,
    showAddFieldDialog,
    editingField,
    isLoading,

    // Getters
    isEditing,
    fieldCount,
    hasFields,

    // Actions
    setFormData,
    setFormFields,
    resetCurrentField,
    openAddFieldDialog,
    openEditFieldDialog,
    closeFieldDialog,
    validateFieldKey,
    addOrUpdateField,
    deleteField,
    moveField,
    updateFieldsOrder,
    addOption,
    removeOption,
    addValidationRule,
    removeValidationRule,
    clearForm,
    setLoading,
  };
});
