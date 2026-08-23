import { supabase } from "./supabase.js";

const BUCKET = "product-images";

/**
 * Upload a File object to Supabase Storage.
 * Enforces multi-tenant isolation by placing files in a folder named after the user's UUID.
 * Returns the public HTTPS URL. Throws on failure.
 */
export async function uploadProductImage(file) {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) throw new Error("Authentication required to upload images.");

  const ext = file.name.split(".").pop().toLowerCase();
  // We prefix the file path with the user's UUID. 
  // This creates a secure, isolated folder for every store owner.
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a product image from Storage by its public URL.
 * Safe to call with null, base64 strings, or any non-Storage URL — it no-ops.
 */
export async function deleteProductImage(url) {
  const path = extractStoragePath(url);
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

/**
 * Returns true if the value is a Storage https:// URL (not base64, not null).
 */
export function isStorageUrl(value) {
  return typeof value === "string" && value.startsWith("https://");
}

/**
 * Extract the file path from a Supabase Storage public URL.
 * Returns null for base64 strings, null values, or non-Storage URLs.
 */
function extractStoragePath(url) {
  if (!url || typeof url !== "string" || !url.startsWith("https://")) return null;
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}
