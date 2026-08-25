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

interface UpdateLessonInput {
    courseId: string;
    lessonId: string;
    title: string;
    content: string;
    position: number;
    instructorId: string;
}

interface ReorderLessonsInput {
    courseId: string;
    lessonIds: string[];
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

export async function getCourseLessons(courseId: string, instructorId: string) {
    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
        },
        select: {
            id: true,
            instructorId: true,
        },
    });

    if (!course) {
        return {
            status: "NOT_FOUND" as const,
        };
    }

    if (course.instructorId !== instructorId) {
        return {
            status: "FORBIDDEN" as const,
        }
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

export async function getLessonById(
    courseId: string,
    lessonId: string,
    instructorId: string
) {
    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
        },
        select: {
            id: true,
            instructorId: true,
        },
    });

    if (!course) {
        return {
            status: "NOT_FOUND" as const,
        };
    }

    if (course.instructorId !== instructorId) {
        return {
            status: "FORBIDDEN" as const,
        };
    }

    const lesson = await prisma.lesson.findUnique({
        where: {
            id: lessonId,
        },
    });

    if (!lesson || lesson.courseId !== courseId) {
        return {
            status: "NOT_FOUND" as const,
        };
    }

    return {
        status: "OK" as const,
        lesson,
    };
}   

export async function updateLesson(input:UpdateLessonInput) {
    const course = await prisma.course.findUnique({
        where: {
            id: input.courseId,
        },
        select: {
            id: true,
            instructorId: true,
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

    const lesson = await prisma.lesson.findUnique({
        where: {
            id: input.lessonId,
        },
    });

    if (!lesson || lesson.courseId !== input.courseId) {
        return {
            status: "LESSON_NOT_FOUND" as const,
        };
    }

    try {
        const updatedLesson = await prisma.lesson.update({
            where: {
                id: input.lessonId,
            },
            data: {
                title: input.title,
                content: input.content,
                position: input.position,
            },
        });

        return {
            status: "UPDATED" as const,
            lesson: updatedLesson,
        };
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
        ) {
            throw new ApiError(409, "A lesson already exists at this position.");
        }
        throw error;
    }
}

export async function deleteLesson(input:{
    courseId: string;
    lessonId: string;
    instructorId: string;
}) {
    const course = await prisma.course.findUnique({
        where: {
            id: input.courseId,
        },
        select: {
            id: true,
            instructorId: true,
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

    const lesson = await prisma.lesson.findUnique({
        where: {
            id: input.lessonId,
        },
    });

    if (!lesson || lesson.courseId !== input.courseId) {
        return {
            status: "LESSON_NOT_FOUND" as const,
        };
    }

    await prisma.lesson.delete({
        where: {
            id: input.lessonId,
        },
    });

    return {
        status: "DELETED" as const,
    };
}

export async function reorderLessons(input:ReorderLessonsInput) {
    const course = await prisma.course.findUnique({
        where: {
            id: input.courseId,
        },
        select: {
            id: true,
            instructorId: true,
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

    const lessons = await prisma.lesson.findMany({
        where: {
            courseId: input.courseId,
        },
        select: {
            id: true,
            position: true,
        },
    });

    if (input.lessonIds.length !== lessons.length) {
        return {
            status: "INVALID_ORDER" as const,
        };
    }

    const existingLessonIds = new Set(
        lessons.map((lesson) => lesson.id)
    );

    const submittedLessonIds = new Set(input.lessonIds);

    if (submittedLessonIds.size !== input.lessonIds.length) {
        return {
            status: "INVALID_ORDER" as const,
        };
    }

    for (const lessonId of input.lessonIds) {
        if (!existingLessonIds.has(lessonId)) {
            return {
                status: "INVALID_ORDER" as const,
            };
        }
    }

    await prisma.$transaction(async (tx) => {

        await Promise.all(
            lessons.map((lesson, index) =>
                tx.lesson.update({
                    where: {
                        id: lesson.id,
                    },
                    data: {
                        position: -(index + 1),
                    },
                })
            )
        );
        
        await Promise.all(
            input.lessonIds.map((lessonId, index) =>
                tx.lesson.update({
                    where: {
                        id: lessonId,
                    },
                    data: {
                        position: index + 1,
                    },
                })
            )
        );

    });

    return {
        status: "REORDERED" as const,
    };
}