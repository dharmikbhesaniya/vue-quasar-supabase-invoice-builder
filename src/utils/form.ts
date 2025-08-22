import { icons } from "src/constants/form";

export const getFieldTypeIcon = (type: string) => {
  return icons[type] || "text_fields";
};
