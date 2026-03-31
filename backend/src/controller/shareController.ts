import { Request, Response, NextFunction } from "express";
import { publishBookSnapshot, unpublishBookSnapshot, getPublicSnapshot } from "../services/shareService.js";
import { NotFoundError } from "../exception/HttpError.js";

// POST /books/:id/publish
export const publishBookHandler = async (
    req: Request<{ userId: string, id: string }, unknown, unknown>,
    res: Response,
    next: NextFunction
) => {
    try {
        const snapshot = await publishBookSnapshot(req.params.id, req.user?.id || "");
        return res.status(200).json(snapshot);
    } catch (e: any) {
        next(e);
    }
}

// POST /books/:id/unpublish
export const unpublishBookHandler = async (
    req: Request<{ userId: string, id: string }, unknown, unknown>,
    res: Response,
    next: NextFunction
) => {
    try {
        await unpublishBookSnapshot(req.params.id, req.user?.id || "");
        return res.status(200).json({ success: true, message: "Book unpublished successfully" });
    } catch (e: any) {
        next(e);
    }
}

// GET /public/books/:shareId
export const fetchPublicBookHandler = async (
    req: Request<{ shareId: string }, unknown, unknown>,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = await getPublicSnapshot(req.params.shareId);
        return res.status(200).json(data);
    } catch (e: any) {
        next(e);
    }
}
