// Temporary health route

import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const healthRouter = Router();

healthRouter.get("/", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        
        res.status(200).json({
            status: "ok",
            database: "connected",
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            database: "disconnected",
        });
    }
});

export default healthRouter;