import prisma from "../api/prismaClient.js";
import { ForbiddenError, RateLimitExceededError, NotFoundError } from "../exception/HttpError.js";
import { ErrorCode } from "../exception/errorCodes.js";

import { AppUser } from "@prisma/client";

export enum UsageFeature {
    LLM = "LLM",
    DICTATION = "DICTATION"
}

export class UsageService {
    private static LLM_LIMIT_PER_DAY = 40;
    public static DICTATION_SECONDS_LIMIT = 3600 * 2; // 2 hours

    /**
     * Gets the current date string in AEST (Australian Eastern Standard Time).
     * Format: YYYY-MM-DD
     */
    private static getAESTDateString(): string {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-CA', { // en-CA gives YYYY-MM-DD
            timeZone: 'Australia/Sydney',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        return formatter.format(now);
    }

    private static async ensureDailyReset(user: AppUser): Promise<AppUser> {
        const currentDate = this.getAESTDateString();
        const isNewDay = user.lastUsageResetDate !== currentDate;

        if (isNewDay) {
            return await prisma.appUser.update({
                where: { id: user.id },
                data: {
                    dailyLlmCount: 0,
                    dailyDictationSeconds: 0,
                    lastUsageResetDate: currentDate
                }
            });
        }
        return user;
    }

    /**
     * Checks if a user is eligible to use a feature and increments their usage count (if LLM).
     * For dictation, it only checks. Time must be added later via addDictationTime.
     * Throws an error if they are not eligible.
     */
    public static async checkAndIncrement(userId: string, feature: UsageFeature): Promise<void> {
        let user = await prisma.appUser.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundError("User not found", ErrorCode.USER_NOT_FOUND);
        }

        // 1. Subscription & Trial Check
        const now = new Date();
        const subscriptionExpired = !user.stripeCurrentPeriodEnd || now > user.stripeCurrentPeriodEnd;
        const isCurrentlySubscribed = user.isSubscribed && !subscriptionExpired;

        if (!isCurrentlySubscribed) {
            // Allow if they haven't used their trial yet (only for LLM feature)
            if (feature === UsageFeature.LLM && !user.hasUsedAiRewrite) {
                // Proceed to trial usage
            } else {
                throw new ForbiddenError(
                    "Active subscription required to use this feature.", 
                    ErrorCode.FORBIDDEN
                );
            }
        }

        // 2. Daily Reset 
        user = await this.ensureDailyReset(user);

        // 3. Limit Check & Increment
        if (feature === UsageFeature.LLM) {
            if (user.dailyLlmCount >= this.LLM_LIMIT_PER_DAY) {
                throw new RateLimitExceededError(
                    `Daily LLM limit of ${this.LLM_LIMIT_PER_DAY} reached. Resets at midnight AEST.`,
                    ErrorCode.RATE_LIMIT_EXCEEDED
                );
            }
            await prisma.appUser.update({
                where: { id: userId },
                data: { dailyLlmCount: user.dailyLlmCount + 1 }
            });
        } else if (feature === UsageFeature.DICTATION) {
            if (user.dailyDictationSeconds >= this.DICTATION_SECONDS_LIMIT) {
                throw new RateLimitExceededError(
                    `Daily Dictation limit of ${this.DICTATION_SECONDS_LIMIT / 60} minutes reached. Resets at midnight AEST.`,
                    ErrorCode.RATE_LIMIT_EXCEEDED
                );
            }
        }
    }

    public static async addDictationTime(userId: string, secondsIncr: number): Promise<void> {
        if (secondsIncr <= 0) return;

        let user = await prisma.appUser.findUnique({ where: { id: userId } });
        if (!user) return;

        user = await this.ensureDailyReset(user);

        await prisma.appUser.update({
            where: { id: userId },
            data: { dailyDictationSeconds: user.dailyDictationSeconds + Math.ceil(secondsIncr) }
        });
    }
}
