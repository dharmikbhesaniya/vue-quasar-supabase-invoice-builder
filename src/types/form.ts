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
    | "file"
    | "editor";
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
