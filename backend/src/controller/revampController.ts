import { Request, Response } from "express";
import { RevampService } from "../services/RevampService.js";
import { revampSchema } from "../schemas/revampSchema.js";

const revampService = new RevampService();

export const revampText = async (req: Request, res: Response): Promise<void> => {
    try {
        const validatedData = revampSchema.parse(req.body);

        const result = await revampService.revampText({
            text: validatedData.text,
            category: validatedData.category,
            tone: validatedData.tone
        });

        res.status(200).json({ revamped: result });
    } catch (error: any) {
        if (error.name === "ZodError") {
            res.status(400).json({ message: "Validation error", errors: error.errors });
            return;
        }

        console.error("RevampController Error:", error);
        res.status(500).json({ message: "An error occurred while revamping the text." });
    }
};
