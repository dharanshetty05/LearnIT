"use client";

import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

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
  const [pendingArchiveId, setPendingArchiveId] = useState<string | null>(null);

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
        setCoursesMessage(data.message ?? "Unable to load courses.");
        return;
      }
      setCourses(data.courses);
    } catch {
      setCoursesMessage("Unable to connect to the backend.");
    } finally {
      setCoursesLoading(false);
    }
  }

  async function confirmArchiveCourse() {
    if (!pendingArchiveId) return;
    const courseId = pendingArchiveId;

    setArchivingCourseId(courseId);
    setCourseMessage("");

    try {
      const response = await apiFetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      const data = response.status === 204 ? null : await response.json();

      if (!response.ok) {
        setCourseMessage(data?.message ?? "Unable to archive course.");
        return;
      }

      await getMyCourses();
    } catch {
      setCourseMessage("Unable to connect to the backend.");
    } finally {
      setArchivingCourseId(null);
      setPendingArchiveId(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Dashboard
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              {name && <span className="font-medium text-foreground">{name}</span>}
              {email && (
                <>
                  <span className="text-border">•</span>
                  <span>{email}</span>
                </>
              )}
              {role && <Badge variant="secondary">{role}</Badge>}
            </div>
            {message && (
              <Alert variant="destructive" className="mt-2 w-fit">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </div>

          {name && (
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              disabled={loggingOut}
              className="sm:self-start"
            >
              {loggingOut && <Loader2 className="h-4 w-4 animate-spin" />}
              {loggingOut ? "Logging out..." : "Log out"}
            </Button>
          )}
        </div>

        {/* Instructor content */}
        {role === "INSTRUCTOR" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Create Course */}
            <Card className="h-fit lg:col-span-2">
              <CardHeader className="p-6 pb-0">
                <CardTitle className="text-base">Create course</CardTitle>
                <CardDescription>Add a new course to your catalog.</CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="course-title">Title</Label>
                    <Input
                      type="text"
                      id="course-title"
                      value={courseTitle}
                      onChange={(event) => setCourseTitle(event.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="course-description">Description</Label>
                    <Textarea
                      id="course-description"
                      value={courseDescription}
                      onChange={(event) => setCourseDescription(event.target.value)}
                      required
                      rows={4}
                    />
                  </div>

                  <Button type="submit" disabled={creatingCourse} className="w-full">
                    {creatingCourse && <Loader2 className="h-4 w-4 animate-spin" />}
                    {creatingCourse ? "Creating..." : "Create course"}
                  </Button>

                  {courseMessage && (
                    <p className="pt-1 text-sm text-muted-foreground">{courseMessage}</p>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* My Courses */}
            <Card className="lg:col-span-3">
              <CardHeader className="flex-row items-center justify-between space-y-0 p-6 pb-0">
                <div className="space-y-1.5">
                  <CardTitle className="text-base">My courses</CardTitle>
                  <CardDescription>Courses you&apos;re currently teaching.</CardDescription>
                </div>
                {!coursesLoading && courses.length > 0 && (
                  <Badge variant="secondary">{courses.length}</Badge>
                )}
              </CardHeader>

              <CardContent className="p-6">
                {coursesLoading && (
                  <div className="space-y-4">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="space-y-2 border-b border-border pb-4 last:border-0">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    ))}
                  </div>
                )}

                {!coursesLoading && coursesMessage && (
                  <Alert variant="destructive">
                    <AlertDescription>{coursesMessage}</AlertDescription>
                  </Alert>
                )}

                {!coursesLoading && !coursesMessage && courses.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border py-10 px-4 text-center">
                    <p className="text-sm font-medium text-foreground">No courses yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Create your first course to start building your catalog.
                    </p>
                  </div>
                )}

                {!coursesLoading && courses.length > 0 && (
                  <div className="divide-y divide-border">
                    {courses.map((course, index) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 space-y-1">
                          <h3 className="truncate text-sm font-medium text-foreground">
                            {course.title}
                          </h3>
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {course.description}
                          </p>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/courses/${course.id}/manage`)}
                          >
                            View
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/courses/${course.id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setPendingArchiveId(course.id)}
                            disabled={archivingCourseId === course.id}
                          >
                            {archivingCourseId === course.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Archive"
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <AlertDialog
        open={pendingArchiveId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingArchiveId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this course?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the course from your active catalog. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchiveCourse}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}