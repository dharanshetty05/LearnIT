"use client";
import { apiFetch } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CourseForm from "../../course-form";

type CourseDetails = {
    id: string;
    title: string;
    description: string;
};

export default function EditCoursePage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        async function checkAccess() {
            try {
                const response = await apiFetch("/api/me", {
                    method: "GET",
                });
                if (!response.ok) {
                    setAuthLoading(false);
                    router.push("/login");
                    return;
                }
                const data = await response.json();
                if (data.role !== "INSTRUCTOR") {
                    setAuthLoading(false);
                    router.push("/dashboard");
                    return;
                }
                setAuthLoading(false);
            } catch {
                setAuthLoading(false);
                router.push("/login");
            }
        }
        checkAccess();
    }, [router]);

    useEffect(() => {
        if (authLoading) return;
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
    }, [courseId, authLoading]);

    async function handleUpdate(data: {
        title: string;
        description: string;
    }) {
        const response = await apiFetch(`/api/courses/${courseId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message ?? "Unable to update course.");
        }
        router.push(`/courses/${courseId}`);
    }

    if (authLoading || loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="flex items-center gap-3 text-slate-500">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                    <p className="text-sm font-medium">Loading...</p>
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
                </div>
            </main>
        );
    }

    if (!course) {
        return null;
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-14">
            <div className="mx-auto w-full max-w-2xl">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Edit Course
                </h1>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <CourseForm
                        initialTitle={course.title}
                        initialDescription={course.description}
                        submitLabel="Update Course"
                        onSubmit={handleUpdate}
                    />
                </div>

                <div className="mt-6">
                    <button
                        type="button"
                        onClick={() => router.push(`/courses/${courseId}`)}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </main>
    );
}
