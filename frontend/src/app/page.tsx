"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState("Checking...")
  const [databaseStatus, setDatabaseStatus] = useState("Checking...")

  useEffect (() => {
    console.log("Health effect ran");
    const fetchHealth = async () => {
      try {
        const response = await fetch("http://localhost:5000/health");

        const data = await response.json();

        setBackendStatus(data.status);
        setDatabaseStatus(data.database);
      } catch (error) {
        setBackendStatus("error");
        setDatabaseStatus("disconnected");
      }
    };

    fetchHealth();
  }, []);

  return (
    <main>
      <h1>LearnIt Backend</h1>

      <p>Backend: {backendStatus}</p>
      <p>Database: {databaseStatus}</p>
    </main>
  );
}
