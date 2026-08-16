import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const authRouter = Router();

authRouter.get("/me", requireAuth, (req, res) => {
    const { user } = req.auth;

    res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    });
});

export default authRouter;