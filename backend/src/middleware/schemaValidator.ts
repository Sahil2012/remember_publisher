import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../exception/HttpError";
import { ErrorCode } from "../exception/errorCodes";
import { ZodError, ZodSchema } from "zod";


interface RequestValidationSchema {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}

export const validate = (schemas: RequestValidationSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schemas.body) {
                req.body = await schemas.body.parseAsync(req.body);
            }
            if (schemas.query) {
                const validatedQuery = await schemas.query.parseAsync(req.query);
                Object.defineProperty(req, 'query', { value: validatedQuery, writable: true });
            }
            if (schemas.params) {
                const validatedParams = await schemas.params.parseAsync(req.params);
                Object.defineProperty(req, 'params', { value: validatedParams, writable: true });
            }
            next();
        } catch (error: any) {
            if (error instanceof ZodError) {
                const errorMessages = error.issues.map((issue) => {
                    const path = issue.path.length > 0 ? issue.path.join('.') : 'Input';
                    return `${path} : ${issue.message}`
                }).join(', ');
                return next(new BadRequestError(errorMessages, ErrorCode.VALIDATION_FAILED, { issues: error.issues }));
            }
            next(error);
        }
    };
};