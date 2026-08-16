const API_URL = "http://localhost:5000";

export async function apiFetch(
    path: string,
    options: RequestInit = {},
) {
    return fetch(`${API_URL}${path}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });
}