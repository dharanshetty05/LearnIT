import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

type LessonFormProps = {
  initialTitle?: string;
  initialContent?: string;
  initialPosition?: number;
  submitLabel: string;
  onSubmit: (data: {
    title: string;
    content: string;
    position: number;
  }) => Promise<void>;
};

export default function LessonForm({
  initialTitle = "",
  initialContent = "",
  initialPosition = 1,
  submitLabel,
  onSubmit,
}: LessonFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [position, setPosition] = useState(String(initialPosition));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!title.trim()) {
      setMessage("Title is required.");
      return;
    }

    if (!content.trim()) {
      setMessage("Content is required.");
      return;
    }

    const parsedPosition = Number(position);

    if (!Number.isInteger(parsedPosition) || parsedPosition <= 0) {
      setMessage("Position must be a positive integer.");
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        position: parsedPosition,
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lesson-title">Title</Label>
        <Input
          id="lesson-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lesson-content">Content</Label>
        <Textarea
          id="lesson-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          disabled={loading}
          rows={8}
          className="resize-y"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lesson-position">Position</Label>
        <Input
          id="lesson-position"
          type="number"
          min="1"
          step="1"
          value={position}
          onChange={(event) => setPosition(event.target.value)}
          disabled={loading}
          className="max-w-40"
        />
        <p className="text-xs text-muted-foreground">
          Determines where this lesson appears in the course.
        </p>
      </div>

      {message && (
        <Alert variant="destructive">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={loading} className="w-fit">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}