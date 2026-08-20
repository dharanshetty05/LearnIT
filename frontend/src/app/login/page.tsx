"use client";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setMessage("");
        try {
            const response = await apiFetch("/api/auth/sign-in/email", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    password,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                setMessage(data.message ?? "Login failed.");
                return;
            }
            router.push("/dashboard");
        } catch {
            setMessage("Unable to connect to the backend.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-12 sm:px-6">
            <div className="w-full max-w-md">
                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                            Login
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Welcome back. Enter your details to continue.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="text"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-150 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                                className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-150 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition duration-150 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            {loading && (
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            )}
                            {loading ? "Logging In..." : "Login"}
                        </button>
                    </form>

                    {message && (
                        <p className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-sm text-slate-700">
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}