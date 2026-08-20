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
        },
    });
}

export async function getCourseById(courseId: string) {
    return prisma.course.findUnique({
        where: {
            id: courseId,
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
        return null;
    }

    if (course.instructorId !== input.instructorId) {
        return null;
    }

    return prisma.course.update({
        where: {
            id: input.courseId,
        },
        data: {
            title: input.title,
            description: input.description,
        },
    });
}