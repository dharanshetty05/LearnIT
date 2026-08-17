import type { RequestHandler } from "express";
import { createCourseSchema } from "../schemas/course.schema.js";
import { ApiError } from "../errors/api-error.js";
import { createCourse } from "../services/course.service.js";

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
                instructorid: course.instructorId,
            },
        });
    } catch (error) {
        next(error);
    }
}