import { useState } from "react";

type CourseFormProps = {
    initialTitle: string;
    initialDescription: string;
    submitLabel: string;
    onSubmit: (data: {
        title: string;
        description: string;
    }) => Promise<void>;
};

export default function CourseForm({
    initialTitle = "",
    initialDescription = "",
    submitLabel,
    onSubmit,
}: CourseFormProps) {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage("");
        if (!title.trim()) {
            setMessage("Title is required.");
            return;
        }
        if (!description.trim()) {
            setMessage("Description is required.");
            return;
        }
        setLoading(true);
        try {
            await onSubmit({
                title: title.trim(),
                description: description.trim(),
            });
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="course-title"
                    className="text-sm font-semibold text-slate-700"
                >
                    Title
                </label>
                <input
                    type="text"
                    id="course-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="course-description"
                    className="text-sm font-semibold text-slate-700"
                >
                    Description
                </label>
                <input
                    type="text"
                    id="course-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
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
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
                {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {loading ? "Saving..." : submitLabel}
            </button>
        </form>
    );
}