"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [registeredEmail, setRegisteredEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password) {
      toast.error("Fill in all fields");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must contain at least 8 characters");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: normalizedName,
          email: normalizedEmail,
          password,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error ?? "Could not create account");
      }

      setRegisteredEmail(normalizedEmail);
      toast.success("Account created");
    } catch (error) {
      console.error("Registration failed:", error);

      toast.error(
        error instanceof Error ? error.message : "Could not create account",
      );
    } finally {
      setLoading(false);
    }
  }

  if (registeredEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
            ✉️
          </div>

          <h1 className="mt-5 text-2xl font-bold text-zinc-900">
            Check your email
          </h1>

          <p className="mt-3 text-zinc-600">
            We sent an account activation link to:
          </p>

          <p className="mt-2 break-all font-semibold text-zinc-900">
            {registeredEmail}
          </p>

          <p className="mt-4 text-sm text-zinc-500">
            Open the email and follow the link to activate your account.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex w-full justify-center rounded-xl bg-zinc-900 p-3 font-medium text-white transition hover:bg-zinc-800"
          >
            Back to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Create account</h1>

        <p className="mt-2 text-sm text-zinc-500">
          Create an account to start tracking your diet.
        </p>

        <form className="mt-6" onSubmit={register}>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            Name
          </label>

          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            className="mb-4 w-full rounded-xl border border-zinc-300 p-3 outline-none transition focus:border-zinc-500"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="mb-4 w-full rounded-xl border border-zinc-300 p-3 outline-none transition focus:border-zinc-500"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="mb-2 w-full rounded-xl border border-zinc-300 p-3 outline-none transition focus:border-zinc-500"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <p className="mb-6 text-xs text-zinc-500">
            Password must contain at least 8 characters.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-zinc-900 p-3 font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
