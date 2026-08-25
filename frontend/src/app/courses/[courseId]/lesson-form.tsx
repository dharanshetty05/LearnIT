import { useState } from "react";

type LessonFormProps = {
    initialTitle?: string;
    initialContent?: string;
    initialPosition?: number;
    submitLabel: string;
    onSubmit: (data : {
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
    onSubmit
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

        if ( !Number.isInteger(parsedPosition) || parsedPosition <= 0 ) {
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
<form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="lesson-title"
                    className="text-sm font-semibold text-slate-700"
                >
                    Title
                </label>

                <input
                    id="lesson-title"
                    type="text"
                    value={title}
                    onChange={(event) =>
                        setTitle(event.target.value)
                    }
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="lesson-content"
                    className="text-sm font-semibold text-slate-700"
                >
                    Content
                </label>

                <textarea
                    id="lesson-content"
                    value={content}
                    onChange={(event) =>
                        setContent(event.target.value)
                    }
                    disabled={loading}
                    rows={8}
                    className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="lesson-position"
                    className="text-sm font-semibold text-slate-700"
                >
                    Position
                </label>

                <input
                    id="lesson-position"
                    type="number"
                    min="1"
                    step="1"
                    value={position}
                    onChange={(event) =>
                        setPosition(event.target.value)
                    }
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100"
                />
            </div>

            {message && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                    {message}
                </p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
                {loading ? "Saving..." : submitLabel}
            </button>
        </form>
    );
}