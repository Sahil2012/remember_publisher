import { IStorageProvider } from "../../interfaces/storageProvider";
import fs from 'fs';
import path from 'path';
import { Stream } from 'stream';

export class LocalStorage implements IStorageProvider {
    private uploadDir: string;
    private baseUrl: string;

    constructor() {
        this.uploadDir = path.join(process.cwd(), 'uploads');
        // Ensure upload directory exists
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }

        // Base URL for serving files
        // In production, this should be an env var. For dev, we assume localhost:PORT
        const port = process.env.PORT || 5000;
        this.baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
    }

    async uploadStream(fileStream: NodeJS.ReadableStream, filename: string, mimeType: string): Promise<string> {
        const filePath = path.join(this.uploadDir, filename);
        const writeStream = fs.createWriteStream(filePath);

        return new Promise((resolve, reject) => {
            fileStream.pipe(writeStream);

            writeStream.on('finish', () => {
                const publicUrl = `${this.baseUrl}/uploads/${filename}`;
                resolve(publicUrl);
            });

            writeStream.on('error', (error) => {
                console.error("Local storage upload error:", error);
                reject(new Error(`Local upload failed: ${error.message}`));
            });

            fileStream.on('error', (error) => {
                console.error("File stream error:", error);
                writeStream.end();
                reject(error);
            });
        });
    }

    async deleteFile(filename: string): Promise<void> {
        const filePath = path.join(this.uploadDir, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}
