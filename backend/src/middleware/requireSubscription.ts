import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../exception/HttpError.js";
import { ErrorCode } from "../exception/errorCodes.js";

export const requireSubscription = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // If the user isn't resolved yet, this middleware assumes it's used after `resolveUser`
    if (!req.user) {
        return next(new ForbiddenError("User details are missing.", ErrorCode.BAD_REQUEST));
    }

    if (!req.user.isSubscribed) {
        return next(new ForbiddenError("This feature requires an active subscription.", ErrorCode.FORBIDDEN));
    }

    // Optional: check if stripeCurrentPeriodEnd is in the past
    if (req.user.stripeCurrentPeriodEnd && new Date(req.user.stripeCurrentPeriodEnd) < new Date()) {
        return next(new ForbiddenError("Your subscription has expired.", ErrorCode.FORBIDDEN));
    }

    next();
};
