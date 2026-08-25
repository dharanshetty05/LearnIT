"use client";

import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Course = {
    id: string;
    title: string;
    description: string;
    instructor: {
        id: string;
        name: string;
    };
};

export default function CoursesPage() {
    const router = useRouter();

    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadCourses() {
            try {
                const response = await apiFetch("/api/courses", {
                    method: "GET",
                });

                const data = await response.json();

                if (!response.ok) {
                    setMessage(data.message ?? "Unable to load courses.");
                    return;
                }

                setCourses(data.courses);
            } catch {
                setMessage("Unable to connect to the backend.");
            } finally {
                setLoading(false);
            }
        }
        loadCourses();
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-10">
                <div className="mx-auto w-full max-w-5xl">
                    <p className="text-sm text-slate-500">
                        Loading courses...
                    </p>
                </div>
            </main>
        );
    }

    if (message) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-10">
                <div className="mx-auto w-full max-w-5xl">
                    <p className="text-sm text-red-600">
                        {message}
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-14">
            <div className="mx-auto w-full max-w-5xl">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Courses
                    </h1>

                    <p className="mt-2 text-sm text-slate-500 sm:text-base">
                        Explore the courses available on LearnIt.
                    </p>
                </div>

                {courses.length === 0 ? (
                    <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                        <h2 className="text-base font-semibold text-slate-900">
                            No courses available
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            There are currently no courses available to browse.
                        </p>
                    </div>
                ) : (
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <article
                                key={course.id}
                                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                            >
                                <div className="flex-1">
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        {course.title}
                                    </h2>

                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        {course.description}
                                    </p>

                                    <p className="mt-4 text-sm text-slate-500">
                                        Instructor:{" "}
                                        <span className="font-medium text-slate-700">
                                            {course.instructor.name}
                                        </span>
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        router.push(`/courses/${course.id}`)
                                    }
                                    className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-800"
                                >
                                    View Course
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}