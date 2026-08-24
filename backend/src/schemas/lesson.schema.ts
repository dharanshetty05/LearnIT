import z from "zod";

export const createLessonSchema = z.object({
    title: z.string().trim().min(1, "Title is required"),
    content: z.string().trim().min(1, "Content is required"),
    position: z.number().int().positive("Position must be a positive integer"),
});

export const updateLessonSchema = z.object({
    title: z.string().trim().min(1, "Title is required"),
    content: z.string().trim().min(1, "Content is required"),
    position: z.number().int().positive("Position must be a positive integer"),
});
