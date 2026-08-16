import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorization.js";

const testRouter = Router();

testRouter.get("/student", requireAuth, requireRole("STUDENT"), (req, res) => {
    res.status(200).json({
        success: true,
        message: "Student access granted",
        user: {
            id: req.auth.user.id,
            name: req.auth.user.name,
            role: req.auth.user.role,
        },
    });
},
);

testRouter.get("/instructor", requireAuth, requireRole("INSTRUCTOR"), (req, res) => {
    res.status(200).json({
        success: true,
        message: "Instructor access granted",
        user: {
            id: req.auth.user.id,
            name: req.auth.user.name,
            role: req.auth.user.role,
        },
    });
},
);

export default testRouter;