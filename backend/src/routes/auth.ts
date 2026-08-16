import { Router } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

const authRouter = Router();

authRouter.get("/me", async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session) {
            res.status(401).json({
                message: "Authentication required",
            });
            return;
        }
        res.status(200).json({
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
        });
    } catch (error) {
        next(error);
    }
});

export default authRouter;