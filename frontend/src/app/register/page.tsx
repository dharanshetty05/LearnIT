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
        <main>
            <h1>Register</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name</label>
                    <input id="name" type="text" value={name} onChange={(event) => setName(event.target.value)} required/>
                </div>

                <div>
                    <label htmlFor="email">Email</label>
                    <input id="email" type="text" value={email} onChange={(event) => setEmail(event.target.value)} required/>
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" value={password} onChange={(event) => setPassword(event.target.value)} required/>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Register"}
                </button>
            </form>

            {message && <p>{message}</p>}
        </main>
    );
}