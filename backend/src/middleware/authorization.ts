import type { RequestHandler } from "express";
import { ApiError } from "../errors/api-error.js";

type Role = "STUDENT" | "INSTRUCTOR";

export const requireRole = (requiredRole: Role): RequestHandler => {
    return (req, res, next) => {
        if (req.auth.user.role !== requiredRole) {
            throw new ApiError(403, "Forbidden");
        }

        next();
    };
};