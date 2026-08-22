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
    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const courseId = params.courseId as string;

    useEffect(() => {
        async function getCourse() {
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
            } finally {
                setLoading(false);
            }
        }
        getCourse();
    }, [courseId]);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="flex items-center gap-3 text-slate-500">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                    <p className="text-sm font-medium">Loading course...</p>
                </div>
            </main>
        );
    }

    if (message) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <p className="text-sm font-medium text-red-600">{message}</p>
                    <button
                        type="button"
                        onClick={() => router.push("/dashboard")}
                        className="mt-6 inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                    >
                        Back to Dashboard
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push(`/courses/${courseId}/edit`)}
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
                    <span aria-hidden="true">←</span> Back to Dashboard
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
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Lessons
                        </h2>
                        {course.lessons.length === 0 ? (
                            <p className="mt-3 text-sm text-slate-500">
                                No lessons available yet.
                            </p>
                        ) : (
                            <ul className="mt-4 flex flex-col gap-2">
                                {course.lessons.map((lesson) => (
                                    <li
                                        key={lesson.id}
                                        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
                                    >
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                                            {lesson.position}
                                        </span>
                                        <span className="font-medium">{lesson.title}</span>
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