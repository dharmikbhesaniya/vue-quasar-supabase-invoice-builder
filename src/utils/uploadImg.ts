import { supabase } from "src/boot/supabase";

export const uploadFile = async (
  bucket: string,
  filePath: string,
  file: File
) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};

export const getPublicUrl = (bucket: string, filePath: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return data.publicUrl;
};
