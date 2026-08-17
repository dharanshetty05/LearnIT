import type { ErrorRequestHandler } from "express";
import { ApiError } from "../errors/api-error.js";

export const errorHandler: ErrorRequestHandler = (err: unknown, req, res, next) => {
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            success: false,
            status: err.statusCode,
            message: err.message,
        });
        return;
    }

    console.error(err);

    res.status(500).json({
        success: false,
        status: 500,
        message: "Internal Server Error",
    });
};

