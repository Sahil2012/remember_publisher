import { clerkClient, getAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";
import { InternalServerError } from "../exception/HttpError";
import { ErrorCode } from "../exception/errorCodes";
import prisma from "../api/prismaClient.js";


export const ensureProfileCreated = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let { userId: clerkUserId } = getAuth(req);
    logger.info(`Authenticated User ID: ${clerkUserId}`);

    const clerkUser = await clerkClient.users.getUser(clerkUserId || "");

    let appUser = await prisma.appUser.findUnique({
        where: { authUserId: clerkUserId || "" },
    });

    if (!appUser) {
        logger.info(`User not found, creating new user with ID: ${clerkUserId}`);

        try {
            appUser = await prisma.appUser.create({
                data: {
                    authUserId: clerkUser.id,
                    email: clerkUser.emailAddresses[0].emailAddress,
                    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
                    profileImage: clerkUser.imageUrl,
                },
            });
            logger.info(`User created successfully with ID: ${clerkUser.id}`);
            next();
        } catch (err: any) {
            logger.error(`Error creating user: ${err.message}`);
            return next(new InternalServerError("Failed to initialize the user.", ErrorCode.INTERNAL_SERVER_ERROR));
        }
    }

    next();
};