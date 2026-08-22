import { prisma } from "../lib/prisma.js";

interface CreateCourseInput {
    title: string,
    description: string,
    instructorId: string,
};

interface UpdateCourseInput {
    courseId: string,
    title: string,
    description: string,
    instructorId: string,
};

interface DeleteCourseInput {
    courseId: string,
    instructorId: string,
};

export async function createCourse(input:CreateCourseInput) {
    return prisma.course.create({
        data: {
            title: input.title,
            description: input.description,
            instructorId: input.instructorId,
        },
    });
}

export async function getInstructorCourses(instructorId: string) {
    return prisma.course.findMany({
        where: {
            instructorId,
            status: "ACTIVE",
        },
    });
}

export async function getCourseById(courseId: string) {
    return prisma.course.findUnique({
        where: {
            id: courseId,
            status: "ACTIVE",
        },
        select: {
            id: true,
            title: true,
            description: true,
            instructor: {
                select: {
                    id: true,
                    name: true,
                },
            },
            lessons: {
                select: {
                    id: true,
                    title: true,
                    position: true,
                },
                orderBy: {
                    position: "asc",
                },
            },
        },
    });
}

export async function updateCourse(input: UpdateCourseInput) {
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

    const updatedCourse = await prisma.course.update({
        where: {
            id: input.courseId,
        },
        data: {
            title: input.title,
            description: input.description,
        },
    });

    return {
        status: "UPDATED" as const,
        course: updatedCourse,
    };
}

export async function archiveCourse(input: DeleteCourseInput) {
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

    const archivedCourse = await prisma.course.update({
        where: {
            id: input.courseId,
        },
        data: {
            status: "ARCHIVED",
        },
    });

    return {
        status: "ARCHIVED" as const,
        course: archivedCourse,
    };
}