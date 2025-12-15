import { supabase } from "./supabaseClient";

interface UploadOptions {
  folder: string; // Carpeta fija ej: "SWB"
  bl_number: string;
  container_number: string;
  batch: string;
  previousUrl?: string | null; // para borrar la anterior
}

export async function uploadDocument(
  file: File,
  options: UploadOptions
) {
  const { folder, bl_number, container_number, batch, previousUrl } = options;

  // 1. BORRAR DOCUMENTO ANTERIOR SI EXISTE
  if (previousUrl) {
    try {
      const urlParts = previousUrl.split("/storage/v1/object/public/containers_files/");
      const relativePath = urlParts[1];

      if (relativePath) {
        await supabase.storage
          .from("containers_files")
          .remove([relativePath]);
      }
    } catch (err) {
      console.warn("No se pudo borrar archivo anterior:", err);
    }
  }

  // 2. GENERAR NOMBRE DE ARCHIVO
  const ext = file.name.split(".").pop();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  const fileName = `${bl_number}_${container_number}_${batch}_${timestamp}.${ext}`;

  const filePath = `${folder}/${fileName}`;

  // 3. SUBIR ARCHIVO
  const { error: uploadError } = await supabase.storage
    .from("containers_files")
    .upload(filePath, file);

  if (uploadError) {
    console.error(uploadError);
    throw uploadError;
  }

  // 4. OBTENER URL PÚBLICA
  const { data } = supabase.storage
    .from("containers_files")
    .getPublicUrl(filePath);

  return data.publicUrl;
}
