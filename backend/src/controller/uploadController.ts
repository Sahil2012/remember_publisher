import { Request, Response, NextFunction } from "express";
import Busboy from "busboy";
import { StorageFactory } from "../services/storage/storageFactory";
import { BadRequestError } from "../exception/HttpError";

import { getAuth } from "@clerk/express";

export const uploadFileHandler = async (req: Request, res: Response, next: NextFunction) => {
    const busboy = Busboy({ headers: req.headers });
    const storage = StorageFactory.getProvider();

    const { userId } = getAuth(req);
    if (!userId) {
        return next(new BadRequestError("User ID not found in request"));
    }

    let isFileUploaded = false;

    busboy.on('file', async (name, file, info) => {
        const { filename, mimeType } = info;
        const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        try {
            // Stream the file directly to storage provider
            const publicUrl = await storage.uploadStream(file, uniqueFilename, mimeType, userId);
            isFileUploaded = true;

            // We only support single file upload per request for simplicity for now
            // Validation: Ensure only one file is processed or handle multiple
            res.status(200).json({ url: publicUrl });
        } catch (error) {
            // If header is already sent (e.g. from another part), we can't send error response
            if (!res.headersSent) {
                next(error);
            }
            // Ensure stream is consumed
            file.resume();
        }
    });

    busboy.on('error', (error: any) => {
        if (!res.headersSent) {
            next(new BadRequestError("Upload failed: " + error.message));
        }
    });

    busboy.on('finish', () => {
        // If no file was found in the request
        if (!isFileUploaded && !res.headersSent) {
            // If we didn't send a response yet (meaning no file event processed successfully)
            // We might want to check if we actually started processing a file.
            // If the response is already sent inside 'file' event, we do nothing.
            // But if specific logic is needed for "no file uploaded", handle here.
        }
    });

    req.pipe(busboy);
};
