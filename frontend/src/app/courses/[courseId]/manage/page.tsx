"use client";

import LessonForm from "../lesson-form";
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

export default function ManageCoursePage() {
    const params = useParams();
    const router = useRouter();

    const courseId = params.courseId as string;

    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [isInstructor, setIsInstructor] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const [showLessonForm, setShowLessonForm] = useState(false);

    const [editingLessonId, setEditingLessonId] = useState<string | null>(
        null
    );

    const [editingLesson, setEditingLesson] = useState<{
        title: string;
        content: string;
        position: number;
    } | null>(null);

    const [lessonLoading, setLessonLoading] = useState(false);

    const [deletingLessonId, setDeletingLessonId] = useState<string | null>(
        null
    );

    const [lessonActionLoading, setLessonActionLoading] = useState(false);

    const [reorderedLessons, setReorderedLessons] = useState<
        CourseDetails["lessons"]
    >([]);

    const [orderChanged, setOrderChanged] = useState(false);
    const [orderSaving, setOrderSaving] = useState(false);

    const canManageCourse =
        isInstructor &&
        currentUserId !== null &&
        course !== null &&
        currentUserId === course.instructor.id;

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

                setCurrentUserId(data.id);
                setIsInstructor(data.role === "INSTRUCTOR");
            } catch {
                setCurrentUserId(null);
                setIsInstructor(false);
            }
        }

        checkRole();
    }, []);

    useEffect(() => {
        if (course) {
            setReorderedLessons(course.lessons);
            setOrderChanged(false);
        }
    }, [course]);

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
            const response = await apiFetch(
                `/api/courses/${courseId}/lessons/${lessonId}`,
                {
                    method: "GET",
                }
            );

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
                error instanceof Error
                    ? error.message
                    : "Unable to load lesson."
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
        if (!editingLessonId) {
            return;
        }

        const response = await apiFetch(
            `/api/courses/${courseId}/lessons/${editingLessonId}`,
            {
                method: "PATCH",
                body: JSON.stringify(data),
            }
        );

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
        const confirmed = window.confirm(
            "Are you sure you want to delete this lesson?"
        );

        if (!confirmed) {
            return;
        }

        setDeletingLessonId(lessonId);
        setLessonActionLoading(true);
        setMessage("");

        try {
            const response = await apiFetch(
                `/api/courses/${courseId}/lessons/${lessonId}`,
                {
                    method: "DELETE",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ?? "Unable to delete lesson."
                );
            }

            if (editingLessonId === lessonId) {
                setEditingLessonId(null);
                setEditingLesson(null);
            }

            await refreshCourse();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to delete lesson."
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

    function moveLessonUp(index: number) {
        if (index === 0) {
            return;
        }

        setReorderedLessons((lessons) => {
            const updated = [...lessons];

            [updated[index - 1], updated[index]] = [
                updated[index],
                updated[index - 1],
            ];

            return updated;
        });

        setOrderChanged(true);
    }

    function moveLessonDown(index: number) {
        if (index === reorderedLessons.length - 1) {
            return;
        }

        setReorderedLessons((lessons) => {
            const updated = [...lessons];

            [updated[index], updated[index + 1]] = [
                updated[index + 1],
                updated[index],
            ];

            return updated;
        });

        setOrderChanged(true);
    }

    async function handleSaveOrder() {
        if (!orderChanged) {
            return;
        }

        setOrderSaving(true);
        setMessage("");

        try {
            const response = await apiFetch(
                `/api/courses/${courseId}/lessons/order`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        lessonIds: reorderedLessons.map(
                            (lesson) => lesson.id
                        ),
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ?? "Unable to save lesson order."
                );
            }

            await refreshCourse();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to save lesson order."
            );
        } finally {
            setOrderSaving(false);
        }
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

                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard")}
                            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-800"
                        >
                            Back to Dashboard
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                router.push(`/courses/${courseId}`)
                            }
                            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-50"
                        >
                            View Public Course
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    if (!course) {
        return null;
    }

    if (!canManageCourse) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <h1 className="text-lg font-semibold text-slate-900">
                        Access denied
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        You do not have permission to manage this course.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            router.push(`/courses/${courseId}`)
                        }
                        className="mt-6 inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-800"
                    >
                        View Public Course
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-14">
            <div className="mx-auto w-full max-w-3xl">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => router.push("/dashboard")}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors duration-150 hover:text-slate-900"
                    >
                        <span aria-hidden="true">←</span>
                        Back to Dashboard
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            router.push(`/courses/${courseId}`)
                        }
                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-50"
                    >
                        View Public Course
                    </button>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Course Management
                        </p>

                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            {course.title}
                        </h1>

                        <p className="mt-3 text-base leading-relaxed text-slate-600">
                            {course.description}
                        </p>
                    </div>

                    <section className="mt-8 border-t border-slate-200 pt-8">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Lessons
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Create and manage the lessons in this
                                    course.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setEditingLessonId(null);
                                    setEditingLesson(null);
                                    setShowLessonForm(
                                        (value) => !value
                                    );
                                }}
                                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-800"
                            >
                                {showLessonForm
                                    ? "Cancel"
                                    : "Add Lesson"}
                            </button>
                        </div>

                        {showLessonForm && (
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

                        {editingLessonId && editingLesson && (
                            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-base font-semibold text-slate-900">
                                            Edit Lesson
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Update this lesson&apos;s
                                            content.
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
                                        initialTitle={
                                            editingLesson.title
                                        }
                                        initialContent={
                                            editingLesson.content
                                        }
                                        initialPosition={
                                            editingLesson.position
                                        }
                                        submitLabel="Save Changes"
                                        onSubmit={
                                            handleUpdateLesson
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {reorderedLessons.length === 0 ? (
                            <p className="mt-5 text-sm text-slate-500">
                                No lessons available yet.
                            </p>
                        ) : (
                            <ul className="mt-5 flex flex-col gap-2">
                                {reorderedLessons.map(
                                    (lesson, index) => (
                                        <li
                                            key={lesson.id}
                                            className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                                                    {index + 1}
                                                </span>

                                                <span className="truncate font-medium">
                                                    {lesson.title}
                                                </span>
                                            </div>

                                            <div className="flex shrink-0 items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        moveLessonUp(
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        index === 0 ||
                                                        orderSaving ||
                                                        lessonActionLoading
                                                    }
                                                    aria-label={`Move ${lesson.title} up`}
                                                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    ↑
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        moveLessonDown(
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        index ===
                                                            reorderedLessons.length -
                                                                1 ||
                                                        orderSaving ||
                                                        lessonActionLoading
                                                    }
                                                    aria-label={`Move ${lesson.title} down`}
                                                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    ↓
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEditLesson(
                                                            lesson.id
                                                        )
                                                    }
                                                    disabled={
                                                        lessonLoading ||
                                                        lessonActionLoading ||
                                                        orderSaving
                                                    }
                                                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteLesson(
                                                            lesson.id
                                                        )
                                                    }
                                                    disabled={
                                                        lessonLoading ||
                                                        lessonActionLoading ||
                                                        orderSaving
                                                    }
                                                    className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors duration-150 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {deletingLessonId ===
                                                    lesson.id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>
                                            </div>
                                        </li>
                                    )
                                )}
                            </ul>
                        )}

                        {orderChanged && (
                            <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-600">
                                    You have unsaved lesson order
                                    changes.
                                </p>

                                <button
                                    type="button"
                                    onClick={handleSaveOrder}
                                    disabled={orderSaving}
                                    className="inline-flex shrink-0 items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                                >
                                    {orderSaving
                                        ? "Saving..."
                                        : "Save Order"}
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}