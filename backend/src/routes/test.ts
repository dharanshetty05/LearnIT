import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorization.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../errors/api-error.js";
import { createCourseController } from "../controllers/course.controller.js";

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

testRouter.get("/courses/:courseId", requireAuth, requireRole("INSTRUCTOR"), async (req, res, next) => {
    try {
        const { courseId } = req.params;

        if (typeof courseId !== "string") {
            throw new ApiError(400, "Invalid course ID");
        }
        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
            },
        });

        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        if (course.instructorId !== req.auth.user.id) {
            throw new ApiError(403, "You do not have access to this course");
        }

        res.status(200).json({
            success: true,
            message: "Course ownership verified",
            courseId: course.id,
        });
    } catch (error) {
        next(error);
    }
},);


// course A ID: e01ada91-1e6a-41f8-807d-1431879c8109
// course B ID: d4478d1a-7f34-439c-bc83-b2e63d9bb3b4
testRouter.post("/course", requireAuth, requireRole("INSTRUCTOR"), createCourseController, );

export default testRouter;