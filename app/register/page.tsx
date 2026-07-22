"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function register() {
    setLoading(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    setLoading(false);

    const result = await response.json();

    if (!response.ok) {
      alert(result.error);
      return;
    }

    alert("Registration successful");

    router.push("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold">Register</h1>

        <input
          className="mb-3 w-full rounded-lg border p-3"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="mb-3 w-full rounded-lg border p-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="mb-6 w-full rounded-lg border p-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          onClick={register}
          className="w-full rounded-lg bg-black p-3 text-white"
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </div>
    </main>
  );
}
