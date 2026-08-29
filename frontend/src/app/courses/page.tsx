"use client";

import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [loading, setLoading] = useState(true);
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

  return (
    <main className="min-h-screen w-full bg-background px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-5xl">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Courses
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Explore the courses available on LearnIt.
          </p>
        </div>

        {loading && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="space-y-3 p-5">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="mt-4 h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && message && (
          <Alert variant="destructive" className="mt-8">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {!loading && !message && courses.length === 0 && (
          <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 px-4 text-center">
            <h2 className="text-sm font-medium text-foreground">
              No courses available
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              There are currently no courses available to browse.
            </p>
          </div>
        )}

        {!loading && !message && courses.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <Card className="flex h-full flex-col transition-colors hover:border-foreground/20">
                  <CardContent className="flex flex-1 flex-col p-5">
                    <div className="flex-1">
                      <h2 className="text-base font-semibold text-foreground">
                        {course.title}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {course.description}
                      </p>
                      <p className="mt-4 text-sm text-muted-foreground">
                        Instructor{" "}
                        <span className="font-medium text-foreground">
                          {course.instructor.name}
                        </span>
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={() => router.push(`/courses/${course.id}`)}
                      className="mt-5 w-full"
                    >
                      View course
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}