import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { IStorageProvider } from "../../interfaces/storageProvider";

export class SupabaseStorage implements IStorageProvider {
    private client: SupabaseClient;
    private bucketName: string;

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase credentials in environment variables.");
        }

        this.client = createClient(supabaseUrl, supabaseKey);
        this.bucketName = process.env.SUPABASE_BUCKET_NAME || "book-covers";
    }

    async uploadStream(fileStream: NodeJS.ReadableStream, filename: string, mimeType: string, userId: string): Promise<string> {
        // Supabase upload accepts ArrayBuffer, ArrayBufferView, Blob, Buffer, File, FormData, NodeJS.ReadableStream, ReadableStream, URLSearchParams, string
        // We pass the stream directly.
        const { data, error } = await this.client.storage
            .from(this.bucketName)
            .upload(`${userId}/${filename}`, fileStream, {
                contentType: mimeType,
                upsert: true,
                duplex: 'half' // Required for node streams in some fetch implementations
            });

        if (error) {
            console.error("Supabase upload error:", error);
            throw new Error(`Upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: publicUrlData } = this.client.storage
            .from(this.bucketName)
            .getPublicUrl(data.path);

        console.log("Supabase Upload Success:", data.path);
        console.log("Generated Public URL:", publicUrlData.publicUrl);

        return publicUrlData.publicUrl;
    }

    async deleteFile(filename: string): Promise<void> {
        const { error } = await this.client.storage
            .from(this.bucketName)
            .remove([filename]);

        if (error) {
            throw new Error(`Delete failed: ${error.message}`);
        }
    }
}
