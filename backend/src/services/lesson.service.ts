import { ApiError } from "../errors/api-error.js";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

interface CreateLessonInput {
    courseId: string;
    title: string;
    content: string;
    position: number;
    instructorId: string;
}

export async function createLesson(input:CreateLessonInput) {
    const course = await prisma.course.findUnique({
        where: {
            id: input.courseId,
        },
    });

    if (!course) {
        return {
            status: "NOT_FOUND" as const,
        };
    }

    if (course.instructorId !== input.instructorId) {
        return {
            status: "FORBIDDEN" as const,
        };
    }

    let lesson;

    try {
        lesson = await prisma.lesson.create({
            data: {
                courseId: input.courseId,
                title: input.title,
                content: input.content,
                position: input.position,
            },
        });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            throw new ApiError(
                409,
                "A lesson already exists at this position."
            );
        }

        throw error;
    }

    return {
        status: "CREATED" as const,
        lesson,
    };
}

export async function getCourseLessons(courseId: string) {
    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
        },
        select: {
            id: true,
        },
    });

    if (!course) {
        return {
            status: "NOT_FOUND" as const,
        };
    }

    const lessons = await prisma.lesson.findMany({
        where: {
            courseId,
        },
        orderBy: {
            position: "asc",
        },
    });
    

    return {
        status: "OK" as const,
        lessons,
    };
}