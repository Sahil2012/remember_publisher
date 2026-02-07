import { IStorageProvider } from "../../interfaces/storageProvider";
import { SupabaseStorage } from "./supabaseStorage";

export class StorageFactory {
    static getProvider(): IStorageProvider {
        // Future: Switch based on env var (e.g., STORAGE_PROVIDER=S3)
        return new SupabaseStorage();
    }
}
