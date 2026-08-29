"use client";

import { apiFetch } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

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

    loadCourse();
  }, [courseId]);

  if (loading) {
    return (
      <main className="min-h-screen w-full bg-background px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-3xl">
          <Skeleton className="h-4 w-32" />
          <Card className="mt-6">
            <CardContent className="space-y-8 p-6 sm:p-8">
              <div className="space-y-3">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <Separator />
              <div className="space-y-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (message) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center p-8 pb-0 text-center">
            <CardTitle>Course unavailable</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-8 pt-6">
            <Button type="button" onClick={() => router.push("/courses")}>
              Back to courses
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <main className="min-h-screen w-full bg-background px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/courses")}
          className="-ml-3 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Button>

        <Card className="mt-4">
          <CardContent className="space-y-8 p-6 sm:p-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {course.title}
              </h1>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {course.description}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Instructor{" "}
                <span className="font-medium text-foreground">
                  {course.instructor.name}
                </span>
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-base font-semibold text-foreground">Lessons</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This course contains {course.lessons.length}{" "}
                {course.lessons.length === 1 ? "lesson" : "lessons"}.
              </p>

              {course.lessons.length === 0 ? (
                <div className="mt-4 rounded-md border border-dashed border-border px-5 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No lessons available yet.
                  </p>
                </div>
              ) : (
                <ol className="mt-4 space-y-2">
                  {course.lessons.map((lesson, index) => (
                    <li
                      key={lesson.id}
                      className="flex items-center gap-3 rounded-md border border-border px-4 py-3"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-medium text-foreground">
                        {index + 1}
                      </span>
                      <span className="min-w-0 truncate text-sm font-medium text-foreground">
                        {lesson.title}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <Separator />

            <div>
              <h2 className="text-base font-semibold text-foreground">
                Ready to learn?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enrollment will be available here.
              </p>
              <Button type="button" disabled className="mt-4">
                Enroll
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}