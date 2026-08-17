import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorization.js";
import { createCourseController } from "../controllers/course.controller.js";

const courseRouter = Router();

courseRouter.post("/", requireAuth, requireRole("INSTRUCTOR"), createCourseController,);

export default courseRouter;