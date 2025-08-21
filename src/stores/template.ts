import { defineStore } from "pinia";
import { ref } from "vue";
import { InvoiceTemplate } from "src/types/invoice";
import { supabase } from "src/boot/supabase";
import { getPublicUrl, uploadFile } from "src/utils/uploadImg";

export const useTemplateStore = defineStore("template", () => {

  // State
  const templates = ref<InvoiceTemplate[]>([]);
  const selectedTemplate = ref<InvoiceTemplate | null>(null);
  const loading = ref(false);

  // Actions
  const loadTemplates = async () => {
    loading.value = true;
    try {
      const { data, error } = await supabase
        .from("invoice_templates")
        .select("*")
        .eq("is_active", true) // Only load active templates
        .order("created_at", { ascending: false });

      if (error) throw error;
      templates.value = data || [];
    } catch (error) {
      console.error("Error loading templates:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Helper function to sanitize filename
  const sanitizeFileName = (fileName: string): string => {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  };

  // Helper function to detect template type
  const detectTemplateType = (fileName: string): "html" | "vue" => {
    return fileName.toLowerCase().endsWith(".vue") ? "vue" : "html";
  };

  const uploadTemplate = async (file: File, name: string) => {
    loading.value = true;
    let uploadedFilePath: string | null = null;

    try {
      // Validate file
      if (!file) {
        throw new Error("No file provided");
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        throw new Error("File size exceeds 5MB limit");
      }

      // Sanitize filename and create unique path
      const sanitizedName = sanitizeFileName(file.name);
      const timestamp = Date.now();
      const fileName = `${timestamp}-${sanitizedName}`;
      const filePath = `templates/${fileName}`;
      uploadedFilePath = filePath;

      console.log("Uploading template:", { fileName, filePath, name });

      // Upload file to Supabase Storage
      const uploadResult = await uploadFile(
        "invoice-templates",
        filePath,
        file
      );
      console.log("Storage upload successful:", uploadResult);

      // Get public URL
      const previewUrl = getPublicUrl("invoice-templates", filePath);

      // Detect template type
      const templateType = detectTemplateType(file.name);

      // Save template metadata to database
      const { data, error } = await supabase
        .from("invoice_templates")
        .insert({
          name: name.trim(),
          description: `Uploaded ${templateType.toUpperCase()} template`,
          file_path: filePath,
          preview_url: previewUrl,
          template_type: templateType,
          is_default: false,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error("Database insert error:", error);
        throw error;
      }

      console.log("Template saved to database:", data);
      templates.value.unshift(data);
      return data;
    } catch (error) {
      console.error("Error uploading template:", error);

      // Cleanup: If database insert failed but file was uploaded, remove the file
      if (
        uploadedFilePath 
        // && error &&
        // error?.message &&
        // !error.message.includes("storage")
      ) {
        try {
          await supabase.storage
            .from("invoice-templates")
            .remove([uploadedFilePath]);
          console.log("Cleaned up uploaded file after database error");
        } catch (cleanupError) {
          console.error("Failed to cleanup uploaded file:", cleanupError);
        }
      }

      throw error;
    } finally {
      loading.value = false;
    }
  };

  const selectTemplate = (template: InvoiceTemplate | null) => {
    selectedTemplate.value = template;
  };

  const deleteTemplate = async (id: string) => {
    loading.value = true;
    try {
      const template = templates.value.find((t) => t.id === id);
      if (!template) throw new Error("Template not found");

      // Don't allow deletion of default templates
      if (template.is_default) {
        throw new Error("Cannot delete default templates");
      }

      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from("invoice-templates")
        .remove([template.file_path]);

      if (storageError) {
        console.warn("Storage deletion failed:", storageError);
        // Don't throw error for storage deletion failure
        // The file might already be deleted or not exist
      }

      // Soft delete from database (mark as inactive)
      const { error } = await supabase
        .from("invoice_templates")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;

      // Remove from local state
      templates.value = templates.value.filter((t) => t.id !== id);

      // Clear selection if deleted template was selected
      if (selectedTemplate.value?.id === id) {
        selectedTemplate.value = null;
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Additional helper methods
  const getTemplateById = (id: string): InvoiceTemplate | undefined => {
    return templates.value.find((t) => t.id === id);
  };

  const getDefaultTemplates = () => {
    return templates.value.filter((t) => t.is_default);
  };

  const getCustomTemplates = () => {
    return templates.value.filter((t) => !t.is_default);
  };

  return {
    // State
    templates,
    selectedTemplate,
    loading,

    // Actions
    loadTemplates,
    uploadTemplate,
    selectTemplate,
    deleteTemplate,

    // Helper methods
    getTemplateById,
    getDefaultTemplates,
    getCustomTemplates,
  };
});
