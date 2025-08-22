// Field type options
export const fieldTypeOptions = [
  { label: "Text", value: "text" },
  { label: "Email", value: "email" },
  { label: "Number", value: "number" },
  { label: "Textarea", value: "textarea" },
  { label: "Select", value: "select" },
  { label: "Checkbox", value: "checkbox" },
  { label: "Radio", value: "radio" },
  { label: "Date", value: "date" },
  { label: "File", value: "file" },
  { label: "Editor", value: "editor" },
];

// Validation type options
export const validationTypeOptions = [
  { label: "Required", value: "required" },
  { label: "Email", value: "email" },
  { label: "Minimum Length", value: "min" },
  { label: "Maximum Length", value: "max" },
  { label: "Pattern", value: "pattern" },
];

export const icons: Record<string, string> = {
  text: "text_fields",
  email: "email",
  number: "numbers",
  textarea: "subject",
  select: "arrow_drop_down",
  checkbox: "check_box",
  radio: "radio_button_checked",
  date: "event",
  file: "attach_file",
  // TODO: change icon
  editor: "attach_file",
};
