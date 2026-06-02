import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

let supabase = null;

if (env.supabaseUrl && env.supabaseKey) {
  supabase = createClient(env.supabaseUrl, env.supabaseKey);
}

export const uploadImageToSupabase = async (filePath) => {
  if (!supabase) {
    throw new HttpError(
      500,
      "Supabase configuration is missing. Cannot upload file."
    );
  }

  const fileExt = path.extname(filePath);
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
  
  try {
    const fileBuffer = await fs.readFile(filePath);
    
    // Determine content type
    let contentType = "image/jpeg";
    if (fileExt.toLowerCase() === ".png") contentType = "image/png";
    if (fileExt.toLowerCase() === ".gif") contentType = "image/gif";

    const { error } = await supabase.storage
      .from(env.supabaseBucket)
      .upload(fileName, fileBuffer, {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(env.supabaseBucket)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error) {
    throw new HttpError(500, "Failed to upload image to Supabase", {
      cause: error.message,
    });
  }
};
