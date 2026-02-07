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
        this.bucketName = "book-covers"; // User can change this or make it dynamic
    }

    async uploadStream(fileStream: NodeJS.ReadableStream, filename: string, mimeType: string): Promise<string> {
        // Supabase upload accepts ArrayBuffer, ArrayBufferView, Blob, Buffer, File, FormData, NodeJS.ReadableStream, ReadableStream, URLSearchParams, string
        // We pass the stream directly.
        const { data, error } = await this.client.storage
            .from(this.bucketName)
            .upload(filename, fileStream, {
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
