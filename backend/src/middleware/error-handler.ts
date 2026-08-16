import type { ErrorRequestHandler } from "express";

interface CustomError extends Error {
    statusCode?: number;
}

export const errorHandler: ErrorRequestHandler = (err: CustomError, req, res, next) => {
    const statusCode = err.statusCode ?? 500;

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: "Internal Server Error",
    });
}

