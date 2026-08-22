import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorization.js";
import { createCourseController, deleteCourseController, getCourseByIdController, getInstructorCoursesController, updateCourseController } from "../controllers/course.controller.js";

const courseRouter = Router();

courseRouter.post("/", requireAuth, requireRole("INSTRUCTOR"), createCourseController,);
courseRouter.get("/mine", requireAuth, requireRole("INSTRUCTOR"), getInstructorCoursesController,);
courseRouter.get("/:courseId", getCourseByIdController);
courseRouter.patch("/:courseId", requireAuth, requireRole("INSTRUCTOR"), updateCourseController,);
courseRouter.delete("/:courseId", requireAuth, requireRole("INSTRUCTOR"), deleteCourseController,);

export default courseRouter;