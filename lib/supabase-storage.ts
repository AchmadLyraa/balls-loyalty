import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a Supabase client with service role key for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function uploadFileToSupabase(
  file: File,
  bucket: string,
  path: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileBuffer = await file.arrayBuffer()
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const filePath = `${path}/${fileName}`

    const { data, error } = await supabaseAdmin.storage.from(bucket).upload(filePath, fileBuffer, {
      contentType: file.type,
      upsert: false,
    })

    if (error) {
      console.error("Supabase upload error:", error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath)

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Upload error:", error)
    return {
      success: false,
      error: "Failed to upload file",
    }
  }
}

export async function deleteFileFromSupabase(
  bucket: string,
  path: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin.storage.from(bucket).remove([path])

    if (error) {
      console.error("Supabase delete error:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Delete error:", error)
    return { success: false, error: "Failed to delete file" }
  }
}

