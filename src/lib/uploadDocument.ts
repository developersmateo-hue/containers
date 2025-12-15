// src/lib/uploadDocument.ts
import { supabase } from "./supabaseClient";

export async function uploadDocument(
  file: File,
  folder: string,               // Carpeta FIJA: "SWB", "CONTRACT", etc.
  bl_number: string,
  container_number: string,
  batch: string,
  previousUrl?: string | null
) {
  console.log("=======================================");
  console.log("📤 Iniciando uploadDocument()");
  console.log("➡️ file:", file?.name);
  console.log("➡️ folder:", folder);
  console.log("➡️ bl_number:", bl_number);
  console.log("➡️ container_number:", container_number);
  console.log("➡️ batch:", batch);
  console.log("➡️ previousUrl:", previousUrl);
  console.log("=======================================");

  // 1. BORRAR ARCHIVO ANTERIOR
  if (previousUrl) {
    try {
      console.log("🗑 Intentando borrar archivo anterior:", previousUrl);

      const relative = previousUrl.split("containers_files/")[1];
      console.log("➡️ relative path:", relative);

      if (relative) {
        const { error: delError } = await supabase.storage
          .from("containers_files")
          .remove([relative]);

        if (delError) {
          console.error("❌ Error borrando archivo anterior:", delError);
        } else {
          console.log("✅ Archivo anterior borrado correctamente");
        }
      }
    } catch (err) {
      console.warn("⚠ No se pudo borrar archivo anterior:", err);
    }
  }

  // 2. GENERAR NOMBRE DE ARCHIVO
  const ext = file.name.split(".").pop();
  const ts = new Date().toISOString().replace(/[:.]/g, "-");

  const filename = `BL_${bl_number}-CONT_${container_number}-BATCH_${batch}-${ts}.${ext}`;

  console.log("📄 Nombre final del archivo:", filename);

  // 3. RUTA FINAL
  const filePath = `${folder}/${filename}`;
  console.log("📁 filePath completo:", filePath);

  // 4. SUBIR ARCHIVO
  const { error: uploadError } = await supabase.storage
    .from("containers_files")
    .upload(filePath, file, { upsert: false });

  if (uploadError) {
    console.error("❌ ERROR SUBIENDO ARCHIVO:", uploadError);
    throw uploadError;
  }

  console.log("✅ Archivo subido correctamente!");

  // 5. URL pública
  const { data } = supabase.storage
    .from("containers_files")
    .getPublicUrl(filePath);

  console.log("🔗 URL pública devuelta:", data.publicUrl);
  console.log("=======================================");

  return data.publicUrl;
}
