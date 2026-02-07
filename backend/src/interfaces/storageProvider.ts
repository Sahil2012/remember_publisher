export interface IStorageProvider {
    uploadStream(fileStream: NodeJS.ReadableStream, filename: string, mimeType: string): Promise<string>;
    deleteFile(filename: string): Promise<void>;
}
