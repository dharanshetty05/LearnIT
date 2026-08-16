import type { RequestHandler } from "express";

type Role = "STUDENT" | "INSTRUCTOR";

export const requireRole = (requiredRole: Role): RequestHandler => {
    return (req, res, next) => {
        if (req.auth.user.role !== requiredRole) {
            res.status(403).json({
                success: false,
                message: "Forbidden",
            });
            return;
        }

        next();
    };
};