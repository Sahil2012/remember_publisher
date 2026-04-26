import { Request, Response } from "express";
import { RevampService } from "../services/RevampService.js";
import { revampSchema } from "../schemas/revampSchema.js";
import { UsageService, UsageFeature } from "../services/UsageService.js";
import { HttpError } from "../exception/HttpError.js";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const revampService = new RevampService();

export const revampText = async (req: Request, res: Response): Promise<void> => {
    try {
        const validatedData = revampSchema.parse(req.body);

         // 1. Usage & Subscription Guard
        await UsageService.checkAndIncrement(req.user!.id, UsageFeature.LLM);
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

         if (error instanceof HttpError) {
            // Handle trial/subscription specific status for the frontend
            if (error.status === 403) {
                res.status(402).json({ 
                    message: error.message, 
                    redirectBilling: true 
                });
                return;
            }
            res.status(error.status).json({ message: error.message });
            return;
        }

        console.error("RevampController Error:", error);
        res.status(500).json({ message: error.message || "An error occurred while revamping the text." });
    }
};

export const standaloneRevampText = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user!;
        
        // 1. Usage & Subscription Guard
        await UsageService.checkAndIncrement(user.id, UsageFeature.LLM);

        const validatedData = revampSchema.parse(req.body);

        const result = await revampService.revampText({
            text: validatedData.text,
            category: validatedData.category,
            tone: validatedData.tone
        });

        await prisma.$transaction([
            prisma.aiRevampRecord.create({
                data: {
                    originalText: validatedData.text,
                    revampedText: result,
                    tone: validatedData.tone,
                    category: validatedData.category,
                    userId: user.id
                }
            }),
            prisma.appUser.update({
                where: { id: user.id },
                data: { hasUsedAiRewrite: true }
            })
        ]);

        res.status(200).json({ revamped: result });
    } catch (error: any) {
        if (error.name === "ZodError") {
            res.status(400).json({ message: "Validation error", errors: error.errors });
            return;
        }

        if (error instanceof HttpError) {
            // Handle trial/subscription specific status for the frontend
            if (error.status === 403) {
                res.status(402).json({ 
                    message: error.message, 
                    redirectBilling: true 
                });
                return;
            }
            res.status(error.status).json({ message: error.message });
            return;
        }

        console.error("RevampController (Standalone) Error:", error);
        res.status(500).json({ message: error.message || "An error occurred while revamping the text." });
    }
};
