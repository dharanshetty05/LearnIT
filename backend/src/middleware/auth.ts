import type { RequestHandler } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

type AuthSession = NonNullable<
    Awaited<ReturnType<typeof auth.api.getSession>>
>;

declare global {
    namespace Express {
        interface Request {
            auth: AuthSession;
        }
    }
}

export const requireAuth: RequestHandler = async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        req.auth = session;

        next();
    } catch (error) {
        next(error);
    }
};