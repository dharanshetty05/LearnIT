import { createLessonSchema } from "../schemas/lesson.schema.js";
import type { Request, Response } from "express";
import { createLesson } from "../services/lesson.service.js";

export async function createLessonController(
    req:Request<{ courseId: string }>,
    res: Response
) {
    const parsed = createLessonSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid lesson data.",
            errors: parsed.error.flatten().fieldErrors,
        });
    }

    const courseId = req.params.courseId;

    if (!courseId) {
        return res.status(400).json({
            message: "Course ID is required.",
        });
    }

    const result = await createLesson({
        courseId,
        title: parsed.data.title,
        content: parsed.data.content,
        position: parsed.data.position,
        instructorId: req.auth.user.id,
    });

    if (result.status === "NOT_FOUND") {
        return res.status(404).json({
            message: "Course not found.",
        });
    }

    if (result.status === "FORBIDDEN") {
        return res.status(403).json({
            message: "You do not own this course.",
        });
    }

    return res.status(201).json({
        message: "Lesson created successfully.",
        lesson: result.lesson,
    });
}