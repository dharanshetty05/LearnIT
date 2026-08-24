import { createLessonSchema, reorderLessonsSchema, updateLessonSchema } from "../schemas/lesson.schema.js";
import type { Request, Response } from "express";
import { createLesson, deleteLesson, getCourseLessons, getLessonById, reorderLessons, updateLesson } from "../services/lesson.service.js";

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

export async function getCourseLessonsController(
    req:Request<{ courseId: string}>,
    res: Response
) {
    const courseId = req.params.courseId;

    if (!courseId) {
        return res.status(400).json({
            message: "Course ID is required.",
        });
    }

    const result = await getCourseLessons(courseId);

    if (result.status === "NOT_FOUND") {
        return res.status(404).json({
            message: "Course not found.",
        });
    }

    return res.status(200).json({
        lessons: result.lessons,
    });
}

export async function getLessonController(
    req: Request<{ courseId: string; lessonId: string }>,
    res: Response
) {
    const { courseId, lessonId } = req.params;

    if (!courseId || !lessonId) {
        return res.status(400).json({
            message: "Course ID and lesson ID are required.",
        });
    }

    const result = await getLessonById(courseId, lessonId);

    if (result.status === "NOT_FOUND") {
        return res.status(404).json({
            message: "Lesson not found.",
        });
    }

    return res.status(200).json({
        lesson: result.lesson,
    });
}

export async function updateLessonController(
    req:Request<{ courseId: string; lessonId: string }>,
    res: Response
) {
    const { courseId, lessonId } = req.params;

    if (!courseId || !lessonId) {
        return res.status(400).json({
            message: "Course ID and lesson ID are required.",
        });
    }

    const parsed = updateLessonSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid lesson data.",
            errors: parsed.error.flatten().fieldErrors,
        });
    }

    const result = await updateLesson({
        courseId,
        lessonId,
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

    if (result.status === "LESSON_NOT_FOUND") {
        return res.status(404).json({
            message: "Lesson not found.",
        });
    }

    return res.status(200).json({
        message: "Lesson updated successfully.",
        lesson: result.lesson,
    });
}

export async function deleteLessonController(
    req: Request<{ courseId: string; lessonId: string }>,
    res: Response
) {
    const { courseId, lessonId } = req.params;

    if (!courseId || !lessonId) {
        return res.status(400).json({
            message: "Course ID and lesson ID are required.",
        });
    }

    const result = await deleteLesson({
        courseId,
        lessonId,
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

    if (result.status === "LESSON_NOT_FOUND") {
        return res.status(404).json({
            message: "Lesson not found.",
        });
    }

    return res.status(200).json({
        message: "Lesson deleted successfully.",
    });
}

export async function reorderLessonsController(
    req: Request<{ courseId: string }>,
    res: Response
) {
    const { courseId } = req.params;

    if (!courseId) {
        return res.status(400).json({
            message: "Course ID is required.",
        });
    }

    const parsed = reorderLessonsSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid lesson order.",
            errors: parsed.error.flatten().fieldErrors,
        });
    }

    const result = await reorderLessons({
        courseId,
        lessonIds: parsed.data.lessonIds,
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

    if (result.status === "INVALID_ORDER") {
        return res.status(400).json({
            message: "The lesson order must contain every lesson in this course exactly once.",
        });
    }

    return res.status(200).json({
        message: "Lessons reordered successfully.",
    });
}