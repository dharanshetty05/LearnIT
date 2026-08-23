"use client";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Course = {
    id: string;
    title: string;
    description: string;
    instructorId: string;
};

export default function DashboardPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [courseTitle, setCourseTitle] = useState("");
    const [courseDescription, setCourseDescription] = useState("");
    const [creatingCourse, setCreatingCourse] = useState(false);
    const [courseMessage, setCourseMessage] = useState("");
    const [courses, setCourses] = useState<Course[]>([]);
    const [coursesLoading, setCoursesLoading] = useState(false);
    const [coursesMessage, setCoursesMessage] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const [archivingCourseId, setArchivingCourseId] = useState<string | null>(null);

    useEffect(() => {
        async function getMe() {
            try {
                const response = await apiFetch("/api/me", {
                    method: "GET",
                });
                if (!response.ok) {
                    setMessage("You are not authenticated");
                    router.push("/login");
                    return;
                }
                const data = await response.json();
                setName(data.name);
                setEmail(data.email);
                setRole(data.role);
                if (data.role === "INSTRUCTOR") {
                    await getMyCourses();
                }
                console.log(data);
            } catch {
                setMessage("Unable to connect to the backend");
            } finally {
                setLoading(false);
            }
        }
        getMe();
    }, []);

    async function handleLogout() {
        setLoggingOut(true);
        setMessage("");
        try {
            const response = await apiFetch("/api/auth/sign-out", {
                method: "POST",
            });
            if (!response.ok) {
                const data = await response.json();
                setMessage(data.message ?? "Logout failed.");
                return;
            }
            setName("");
            setEmail("");
            setRole("");
            router.push("/login");
        } catch {
            setMessage("Unable to connect to the backend");
        } finally {
            setLoggingOut(false);
        }
    }

    async function handleCreateCourse(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setCreatingCourse(true);
        setCourseMessage("");
        try {
            const response = await apiFetch("/api/courses", {
                method: "POST",
                body: JSON.stringify({
                    title: courseTitle,
                    description: courseDescription,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                setCourseMessage(data.message ?? "Unable to create course.");
                return;
            }
            setCourseMessage("Course created successfully.");
            setCourseTitle("");
            setCourseDescription("");
            await getMyCourses();
        } catch {
            setCourseMessage("Unable to connect to the backend.");
        } finally {
            setCreatingCourse(false);
        }
    }

    async function getMyCourses() {
        setCoursesLoading(true);
        setCourseMessage("");
        try {
            const response = await apiFetch("/api/courses/mine", {
                method: "GET",
            });
            const data = await response.json();
            if (!response.ok) {
                setCourseMessage(data.message ?? "Unable to load courses.");
                return;
            }
            setCourses(data.courses);
        } catch {
            setCourseMessage("Unable to connect to the backend.");
        } finally {
            setCoursesLoading(false);
        }
    }

    async function handleArchiveCourse(courseId:string) {
        const confirmed = window.confirm(
            "Are you sure you want to archive this course?"
        );

        if (!confirmed) {
            return;
        }

        setArchivingCourseId(courseId);
        setCourseMessage("");

        try {
            const response = await apiFetch(`/api/courses/${courseId}`, {
                method: "DELETE",
            });

            const data = response.status === 204 ? null : await response.json();

            if (!response.ok) {
                setCourseMessage(
                    data?.message ?? "Unable to archive course."
                );
                return;
            }

            await getMyCourses();
        } catch {
            setCourseMessage("Unable to connect to the backend.");
        } finally {
            setArchivingCourseId(null);
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin" />
                    <p className="text-sm font-medium text-slate-500">Loading your dashboard...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

                {/* Header */}
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between border-b border-slate-200 pb-8 mb-8">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                            Dashboard
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                            {name && <span className="font-medium text-slate-700">{name}</span>}
                            {email && (
                                <>
                                    <span className="text-slate-300">•</span>
                                    <span>{email}</span>
                                </>
                            )}
                            {role && (
                                <>
                                    <span className="text-slate-300">•</span>
                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                                        {role}
                                    </span>
                                </>
                            )}
                        </div>
                        {message && (
                            <p className="text-sm text-red-600 pt-1">{message}</p>
                        )}
                    </div>

                    {name && (
                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:self-start"
                        >
                            {loggingOut ? "Logging out..." : "Logout"}
                        </button>
                    )}
                </div>

                {/* Instructor content */}
                {role === "INSTRUCTOR" && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                        {/* Create Course */}
                        <section className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
                            <div className="mb-5">
                                <h2 className="text-base font-semibold text-slate-900">Create Course</h2>
                                <p className="text-sm text-slate-500 mt-0.5">Add a new course to your catalog.</p>
                            </div>

                            <form onSubmit={handleCreateCourse} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="course-title"
                                        className="block text-sm font-medium text-slate-700"
                                    >
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        id="course-title"
                                        value={courseTitle}
                                        onChange={(event) => setCourseTitle(event.target.value)}
                                        required
                                        className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="course-description"
                                        className="block text-sm font-medium text-slate-700"
                                    >
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        id="course-description"
                                        value={courseDescription}
                                        onChange={(event) => setCourseDescription(event.target.value)}
                                        required
                                        className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={creatingCourse}
                                    className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {creatingCourse ? "Creating..." : "Create Course"}
                                </button>

                                {courseMessage && (
                                    <p className="text-sm text-slate-600 pt-1">{courseMessage}</p>
                                )}
                            </form>
                        </section>

                        {/* My Courses */}
                        <section className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900">My Courses</h2>
                                    <p className="text-sm text-slate-500 mt-0.5">Courses you're currently teaching.</p>
                                </div>
                                {!coursesLoading && courses.length > 0 && (
                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                        {courses.length}
                                    </span>
                                )}
                            </div>

                            {coursesLoading && (
                                <div className="space-y-3">
                                    {[0, 1, 2].map((i) => (
                                        <div
                                            key={i}
                                            className="animate-pulse rounded-lg border border-slate-200 p-4"
                                        >
                                            <div className="h-4 w-1/3 rounded bg-slate-200 mb-2" />
                                            <div className="h-3 w-2/3 rounded bg-slate-100" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!coursesLoading && coursesMessage && (
                                <p className="text-sm text-red-600">{coursesMessage}</p>
                            )}

                            {!coursesLoading && !coursesMessage && courses.length === 0 && (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-10 px-4 text-center">
                                    <p className="text-sm font-medium text-slate-700">No courses yet</p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        You haven&apos;t created any courses yet.
                                    </p>
                                </div>
                            )}

                            {!coursesLoading && courses.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {courses.map((course) => (
                                        <article
    key={course.id}
    className="rounded-lg border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm"
>
    <h3 className="text-sm font-semibold text-slate-900">
        <span className="block text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">
            Title
        </span>
        {course.title}
    </h3>

    <p className="text-sm text-slate-600 mt-2">
        <span className="block text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">
            Description
        </span>
        {course.description}
    </p>

    <div className="mt-4 flex gap-2">
        <button
            type="button"
            onClick={() => router.push(`/courses/${course.id}`)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
            View
        </button>

        <button
            type="button"
            onClick={() => router.push(`/courses/${course.id}/edit`)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
            Edit
        </button>

        <button
            type="button"
            onClick={() => handleArchiveCourse(course.id)}
            disabled={archivingCourseId === course.id}
            className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {archivingCourseId === course.id
                ? "Archiving..."
                : "Archive"}
        </button>
    </div>
</article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </main>
    );
}