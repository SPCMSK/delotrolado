import { createSupabaseBrowser } from "./supabase-browser";

/**
 * Upload a file to Supabase Storage and return the public URL.
 * Throws on failure.
 */
export async function uploadImage(
  bucket: string,
  file: File
): Promise<string> {
  const supabase = createSupabaseBrowser();
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, file, {
      contentType: file.type,
      cacheControl: "3600",
    });

  if (error) throw new Error(`Error al subir imagen: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

/**
 * Delete a file from Supabase Storage by its public URL.
 */
export async function deleteImage(
  bucket: string,
  url: string
): Promise<void> {
  const supabase = createSupabaseBrowser();
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  if (filename) {
    await supabase.storage.from(bucket).remove([filename]);
  }
}
