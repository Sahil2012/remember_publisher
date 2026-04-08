
import { Request, Response } from "express";

export const getMe = async (req: Request, res: Response) => {
    const user = req.user;
    res.status(200).json({ user, message: "User info retrieved" });
};