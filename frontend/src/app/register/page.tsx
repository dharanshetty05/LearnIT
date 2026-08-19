"use client";
import { apiFetch } from "@/lib/api";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setMessage("");
        try {
            const response = await apiFetch("/api/auth/sign-up/email", {
                method: "POST",
                body: JSON.stringify({
                    name, 
                    email,
                    password,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                setMessage(data.message ?? "Registration failed.");
                return;
            }
            setMessage(`Registration successful. Welcome, ${data.user.name}!`);
        } catch {
            setMessage("Unable to connect to the backend.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 sm:px-6">
            {/* Decorative background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
                <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/20 blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:44px_44px]" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                            Register
                        </h1>
                        <p className="mt-2 text-sm text-slate-400">
                            Create your account to get started.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-slate-300"
                            >
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
                                className="block w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition duration-150 focus:border-indigo-500 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-300"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="text"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                className="block w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition duration-150 focus:border-indigo-500 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-300"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                                className="block w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition duration-150 focus:border-indigo-500 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition duration-150 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:bg-indigo-600/50 disabled:opacity-70"
                        >
                            {loading && (
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            )}
                            {loading ? "Creating account..." : "Register"}
                        </button>
                    </form>

                    {message && (
                        <p className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-center text-sm text-slate-200">
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}