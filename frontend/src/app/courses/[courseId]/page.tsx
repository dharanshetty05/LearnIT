"use client";

import LessonForm from "./lesson-form";
import { apiFetch } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type CourseDetails = {
    id: string;
    title: string;
    description: string;
    instructor: {
        id: string;
        name: string;
    };
    lessons: {
        id: string;
        title: string;
        position: number;
    }[];
};

export default function CourseDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [isInstructor, setIsInstructor] = useState(false);
    const [showLessonForm, setShowLessonForm] = useState(false);

    const courseId = params.courseId as string;

    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [editingLesson, setEditingLesson] = useState<{
        title: string;
        content: string;
        position: number;
    } | null>(null);
    const [lessonLoading, setLessonLoading] = useState(false);

    const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
    const [lessonActionLoading, setLessonActionLoading] = useState(false);

    const refreshCourse = useCallback(async () => {
        try {
            const response = await apiFetch(`/api/courses/${courseId}`, {
                method: "GET",
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message ?? "Unable to load course.");
                return;
            }

            setCourse(data.course);
        } catch {
            setMessage("Unable to connect to the backend.");
        }
    }, [courseId]);

    useEffect(() => {
        async function loadCourse() {
            setLoading(true);
            await refreshCourse();
            setLoading(false);
        }

        loadCourse();
    }, [refreshCourse]);

    useEffect(() => {
        async function checkRole() {
            try {
                const response = await apiFetch("/api/me", {
                    method: "GET",
                });

                if (!response.ok) {
                    return;
                }

                const data = await response.json();

                setIsInstructor(data.role === "INSTRUCTOR");
            } catch {
                setIsInstructor(false);
            }
        }

        checkRole();
    }, []);

    async function handleCreateLesson(data: {
        title: string;
        content: string;
        position: number;
    }) {
        const response = await apiFetch(
            `/api/courses/${courseId}/lessons`,
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ?? "Unable to create lesson."
            );
        }

        setShowLessonForm(false);

        await refreshCourse();
    }

    async function handleEditLesson(lessonId: string) {
        setLessonLoading(true);
        setMessage("");

        try {
            const response = await apiFetch(`/api/courses/${courseId}/lessons/${lessonId}`, {
                method: "GET",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ?? "Unable to load lesson."
                );
            }

            setEditingLessonId(lessonId);
            setEditingLesson({
                title: result.lesson.title,
                content: result.lesson.content,
                position: result.lesson.position,
            });

            setShowLessonForm(false);
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Unable to load lesson."
            );
        } finally {
            setLessonLoading(false);
        }
    }

    async function handleUpdateLesson(data: {
        title: string;
        content: string;
        position: number;
    }) {
        if (!editingLessonId)   return;

        const response = await apiFetch(`/api/courses/${courseId}/lessons/${editingLessonId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ?? "Unable to update lesson."
            );
        }

        setEditingLessonId(null);
        setEditingLesson(null);

        await refreshCourse();
    }

    async function handleDeleteLesson(lessonId: string) {
        const confirmed = window.confirm("Are you sure you want to delete this lesson?");

        if (!confirmed) return;

        setDeletingLessonId(lessonId);
        setLessonActionLoading(true);
        setMessage("");

        try {
            const response = await apiFetch(`/api/courses/${courseId}/lessons/${lessonId}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message ?? "Unable to delete lesson.");
            }

            if (editingLessonId === lessonId) {
                setEditingLessonId(null);
                setEditingLesson(null);
            }

            await refreshCourse();
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Unable to delete lesson."
            );
        } finally {
            setDeletingLessonId(null);
            setLessonActionLoading(false);
        }
    }

    function cancelLessonEdit() {
        setEditingLessonId(null);
        setEditingLesson(null);
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="flex items-center gap-3 text-slate-500">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                    <p className="text-sm font-medium">
                        Loading course...
                    </p>
                </div>
            </main>
        );
    }

    if (message) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <p className="text-sm font-medium text-red-600">
                        {message}
                    </p>

                    <button
                        type="button"
                        onClick={() => router.push("/dashboard")}
                        className="mt-6 inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                    >
                        Back to Dashboard
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            router.push(`/courses/${courseId}/edit`)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
                    >
                        Edit Course
                    </button>
                </div>
            </main>
        );
    }

    if (!course) {
        return null;
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-14">
            <div className="mx-auto w-full max-w-3xl">
                <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors duration-150 hover:text-slate-900"
                >
                    <span aria-hidden="true">←</span>{" "}
                    Back to Dashboard
                </button>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        {course.title}
                    </h1>

                    <p className="mt-3 text-base leading-relaxed text-slate-600">
                        {course.description}
                    </p>

                    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <section>
                            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Instructor
                            </h2>

                            <p className="mt-2 text-sm font-medium text-slate-900">
                                {course.instructor.name}
                            </p>
                        </section>
                    </div>

                    <section className="mt-8 border-t border-slate-200 pt-8">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Lessons
                            </h2>

                            {isInstructor && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingLessonId(null);
                                        setEditingLesson(null);
                                        setShowLessonForm(
                                            (value) => !value
                                        )
                                    }}
                                    className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-800"
                                >
                                    {showLessonForm
                                        ? "Cancel"
                                        : "Add Lesson"}
                                </button>
                            )}
                        </div>

                        {showLessonForm && isInstructor && (
                            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
                                <h3 className="text-base font-semibold text-slate-900">
                                    Create Lesson
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Add a lesson to this course.
                                </p>

                                <div className="mt-5">
                                    <LessonForm
                                        initialPosition={
                                            course.lessons.length + 1
                                        }
                                        submitLabel="Create Lesson"
                                        onSubmit={
                                            handleCreateLesson
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {editingLessonId && editingLesson && isInstructor && (
                            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-base font-semibold text-slate-900">
                                            Edit Lesson
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Update this lesson's content.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={cancelLessonEdit}
                                        className="text-sm font-semibold text-slate-500 hover:text-slate-900"
                                    >
                                        Cancel
                                    </button>
                                </div>

                                <div className="mt-5">
                                    <LessonForm
                                        initialTitle={editingLesson.title}
                                        initialContent={editingLesson.content}
                                        initialPosition={editingLesson.position}
                                        submitLabel="Save Changes"
                                        onSubmit={handleUpdateLesson}
                                    />
                                </div>
                            </div>
                        )}

                        {course.lessons.length === 0 ? (
                            <p className="mt-3 text-sm text-slate-500">
                                No lessons available yet.
                            </p>
                        ) : (
                            <ul className="mt-4 flex flex-col gap-2">
                                {course.lessons.map((lesson) => (
                                    <li
                                        key={lesson.id}
                                        className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                                                {lesson.position}
                                            </span>

                                            <span className="truncate font-medium">
                                                {lesson.title}
                                            </span>
                                        </div>

                                        {isInstructor && (
                                            <div className="flex shrink-0 items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditLesson(lesson.id)}
                                                    disabled={
                                                        lessonLoading ||
                                                        lessonActionLoading
                                                    }
                                                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteLesson(lesson.id)}
                                                    disabled={
                                                        lessonLoading ||
                                                        lessonActionLoading
                                                    }
                                                    className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors duration-150 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {deletingLessonId === lesson.id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}