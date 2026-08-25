import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorization.js";
import { createCourseController, deleteCourseController, getCourseByIdController, getInstructorCoursesController, getPublicCoursesController, updateCourseController } from "../controllers/course.controller.js";
import { createLessonController, deleteLessonController, getCourseLessonsController, getLessonController, reorderLessonsController, updateLessonController } from "../controllers/lesson.controller.js";

const courseRouter = Router();

// Course related endpoints
courseRouter.post("/", requireAuth, requireRole("INSTRUCTOR"), createCourseController,);
courseRouter.get("/mine", requireAuth, requireRole("INSTRUCTOR"), getInstructorCoursesController,);
courseRouter.get("/:courseId", getCourseByIdController);
courseRouter.get("/", getPublicCoursesController);
courseRouter.patch("/:courseId", requireAuth, requireRole("INSTRUCTOR"), updateCourseController,);
courseRouter.delete("/:courseId", requireAuth, requireRole("INSTRUCTOR"), deleteCourseController,);

// Lesson related endpoints
courseRouter.post("/:courseId/lessons", requireAuth, requireRole("INSTRUCTOR"), createLessonController,);
courseRouter.get("/:courseId/lessons", requireAuth, getCourseLessonsController,);
courseRouter.get("/:courseId/lessons/:lessonId", requireAuth, getLessonController,);
courseRouter.patch("/:courseId/lessons/order", requireAuth, requireRole("INSTRUCTOR"), reorderLessonsController,);
courseRouter.patch("/:courseId/lessons/:lessonId", requireAuth, requireRole("INSTRUCTOR"), updateLessonController);
courseRouter.delete("/:courseId/lessons/:lessonId", requireAuth, requireRole("INSTRUCTOR"), deleteLessonController,);

export default courseRouter;