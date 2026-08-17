import { prisma } from "../lib/prisma.js";

interface CreateCourseInput {
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