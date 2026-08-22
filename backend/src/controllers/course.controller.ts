import type { RequestHandler } from "express";
import { createCourseSchema, updateCourseSchema } from "../schemas/course.schema.js";
import { ApiError } from "../errors/api-error.js";
import { createCourse, getCourseById, getInstructorCourses, updateCourse } from "../services/course.service.js";

export const createCourseController: RequestHandler = async (req, res, next,) => {
    try {
        const result = createCourseSchema.safeParse(req.body);

        if (!result.success) {
            throw new ApiError(400, "Invalid course data");
        }

        const course = await createCourse({
            title: result.data.title,
            description: result.data.description,
            instructorId: req.auth.user.id,
        });

        res.status(201).json({
            success: true,
            course: {
                id: course.id,
                title: course.title,
                description: course.description,
                instructorId: course.instructorId,
            },
        });
    } catch (error) {
        next(error);
    }
}

export const getInstructorCoursesController: RequestHandler = async (req, res, next,) => {
    try {
        const courses = await getInstructorCourses(req.auth.user.id);

        res.status(200).json({
            success: true,
            courses,
        });
    } catch (error) {
        next(error);
    }
};

export const getCourseByIdController: RequestHandler<{ courseId: string }> = async (req, res, next,) => {
    try {
        const course = await getCourseById(req.params.courseId);

        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        res.status(200).json({
            success: true,
            course,
        });
    } catch (error) {
        next(error);
    }
};

export const updateCourseController: RequestHandler<{
    courseId: string;
}>= async (req, res, next) => {
    try {
        const parsed = updateCourseSchema.safeParse(req.body);

        if (!parsed.success) {
            throw new ApiError(400, "Invalid course data");
        }

        const result = await updateCourse({
            courseId: req.params.courseId,
            instructorId: req.auth.user.id,
            title: parsed.data.title,
            description: parsed.data.description,
        });

        if (result.status === "NOT_FOUND") {
            throw new ApiError(404, "Course not found");
        }

        if (result.status === "FORBIDDEN") {
            throw new ApiError(403, "Forbidden");
        }

        res.status(200).json({
            success: true,
            course: result.course,
        });
    } catch (error) {
        next(error);
    }
};