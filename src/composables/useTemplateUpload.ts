import { ref } from "vue";
import { useTemplateStore } from "src/stores/template";

export const useTemplateUpload = () => {
  const templateStore = useTemplateStore();

  const uploading = ref(false);
  const uploadProgress = ref(0);

  const validateFile = (file: File) => {
    const allowedTypes = ["text/html", "application/octet-stream"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.endsWith(".html") &&
      !file.name.endsWith(".vue")
    ) {
      throw new Error("Only HTML and Vue files are allowed");
    }

    if (file.size > maxSize) {
      throw new Error("File size must be less than 5MB");
    }

    return true;
  };

  const uploadTemplate = async (file: File, name: string) => {
    uploading.value = true;
    uploadProgress.value = 0;

    try {
      validateFile(file);

      const result = await templateStore.uploadTemplate(file, name);
      uploadProgress.value = 100;

      return result;
    } catch (error) {
      console.error("Template upload error:", error);
      throw error;
    } finally {
      uploading.value = false;
    }
  };

  return {
    uploading,
    uploadProgress,
    uploadTemplate,
    validateFile,
  };
};
