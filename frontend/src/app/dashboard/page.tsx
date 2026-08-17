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

    useEffect(() => {
        async function getMe() {
            try {
                const response = await apiFetch("/api/me", {
                    method: "GET",
                });
                if(!response.ok) {
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

    async function handleCreateCourse(event:React.FormEvent<HTMLFormElement>) {
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

    if (loading) {
        return (
            <main>
                <h1>Dashboard</h1>
                <p>Loading...</p>
            </main>
        );
    }

    return (
        <main>
            <h1>Dashboard</h1>

            {name && <p>{name}</p>}
            {email && <p>{email}</p>}
            {role && <p>{role}</p>}

            {message && <p>{message}</p>}

            {name && (
                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                >
                    {loggingOut ? "Logging out..." : "Logout"}
                </button>
            )}

            {role === "INSTRUCTOR" && (
                <section>
                    <h2>Create Course</h2>

                    <form onSubmit={handleCreateCourse}>
                        <label htmlFor="course-title">Title</label>

                        <input type="text" id="course-title" value={courseTitle} onChange={(event) => setCourseTitle(event.target.value)} required/>

                        <label htmlFor="course-description">Description</label>

                        <input type="text" id="course-description" value={courseDescription} onChange={(event) => setCourseDescription(event.target.value)} required/>

                        <button type="submit" disabled={creatingCourse}>
                            {creatingCourse ? "Creating..." : "Create Course"}
                        </button>
                    </form>

                    {courseMessage && <p>{courseMessage}</p>}
                </section>
            )}

            {role == "INSTRUCTOR" && (
                <section className="flex flex-col w-64 flex-auto items-center">
                    <h2 className="font-bold">My Courses</h2>

                    {coursesLoading && <p>Loading courses...</p>}

                    {!coursesLoading && coursesMessage && (
                        <p>{coursesMessage}</p>
                    )}

                    {!coursesLoading &&  !coursesMessage && courses.length === 0 && (
                        <p>You haven't created any courses yet.</p>
                    )}

                    {!coursesLoading && courses.length > 0 && (
                        <div>
                            {courses.map((course) => (
                                <article key={course.id}>
                                    <h3><i>Title:</i>{course.title}</h3>
                                    <p><i>Description:</i>{course.description}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </main>
    );
}