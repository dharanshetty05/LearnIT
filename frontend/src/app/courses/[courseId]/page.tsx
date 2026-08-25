"use client";

import { apiFetch } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

    const courseId = params.courseId as string;

    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadCourse() {
            try {
                const response = await apiFetch(
                    `/api/courses/${courseId}`,
                    {
                        method: "GET",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    setMessage(
                        data.message ?? "Unable to load course."
                    );
                    return;
                }

                setCourse(data.course);
            } catch {
                setMessage(
                    "Unable to connect to the backend."
                );
            } finally {
                setLoading(false);
            }
        }

        loadCourse();
    }, [courseId]);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-10">
                <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center">
                    <p className="text-sm font-medium text-slate-500">
                        Loading course...
                    </p>
                </div>
            </main>
        );
    }

    if (message) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-14">
                <div className="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center">
                    <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                        <h1 className="text-lg font-semibold text-slate-900">
                            Course unavailable
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            {message}
                        </p>

                        <button
                            type="button"
                            onClick={() => router.push("/courses")}
                            className="mt-6 inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-800"
                        >
                            Back to Courses
                        </button>
                    </div>
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
                    onClick={() => router.push("/courses")}
                    className="text-sm font-semibold text-slate-600 transition-colors duration-150 hover:text-slate-900"
                >
                    ← Back to Courses
                </button>

                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        {course.title}
                    </h1>

                    <p className="mt-4 text-base leading-relaxed text-slate-600">
                        {course.description}
                    </p>

                    <div className="mt-8 rounded-xl bg-slate-50 p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Instructor
                        </p>

                        <p className="mt-2 text-sm font-semibold text-slate-900">
                            {course.instructor.name}
                        </p>
                    </div>

                    <section className="mt-8 border-t border-slate-200 pt-8">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Lessons
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                This course contains{" "}
                                {course.lessons.length}{" "}
                                {course.lessons.length === 1
                                    ? "lesson"
                                    : "lessons"}
                                .
                            </p>
                        </div>

                        {course.lessons.length === 0 ? (
                            <div className="mt-5 rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center">
                                <p className="text-sm font-medium text-slate-700">
                                    No lessons available yet.
                                </p>
                            </div>
                        ) : (
                            <ol className="mt-5 space-y-3">
                                {course.lessons.map(
                                    (lesson, index) => (
                                        <li
                                            key={lesson.id}
                                            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4"
                                        >
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                                                {index + 1}
                                            </span>

                                            <span className="min-w-0 text-sm font-medium text-slate-800">
                                                {lesson.title}
                                            </span>
                                        </li>
                                    )
                                )}
                            </ol>
                        )}
                    </section>

                    <section className="mt-8 border-t border-slate-200 pt-8">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                            <h2 className="text-base font-semibold text-slate-900">
                                Ready to learn?
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Enrollment will be available here.
                            </p>

                            <button
                                type="button"
                                disabled
                                className="mt-4 inline-flex items-center justify-center rounded-lg bg-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600"
                            >
                                Enroll
                            </button>
                        </div>
                    </section>
                </section>
            </div>
        </main>
    );
}