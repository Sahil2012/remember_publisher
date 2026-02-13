import { IStorageProvider } from "../../interfaces/storageProvider";
import { SupabaseStorage } from "./supabaseStorage";
import { LocalStorage } from "./localStorage";

export class StorageFactory {
    static getProvider(): IStorageProvider {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
            return new SupabaseStorage();
        }

        console.warn("StorageFactory: Supabase credentials missing. Falling back to LocalStorage.");
        return new LocalStorage();
    }
}
