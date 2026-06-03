import { createClient } from "@supabase/supabase-js";
import path from "node:path";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

let supabase = null;

if (env.supabaseUrl && env.supabaseKey) {
  supabase = createClient(env.supabaseUrl, env.supabaseKey);
}

export const uploadImageToSupabase = async ({ fileBuffer, mimetype, originalname }) => {
  if (!supabase) {
    throw new HttpError(
      500,
      "Supabase configuration is missing. Cannot upload file."
    );
  }

  const ext = path.extname(originalname) || ".jpg";
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  
  try {
    const { error } = await supabase.storage
      .from(env.supabaseBucket)
      .upload(fileName, fileBuffer, {
        contentType: mimetype,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw error;
    }

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
