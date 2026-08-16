"use client";

import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");

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
        </main>
    );
}