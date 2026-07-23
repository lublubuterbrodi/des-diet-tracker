import Link from "next/link";

import {
  deleteVerificationToken,
  findVerificationToken,
  hashVerificationToken,
} from "@/repositories/email-verification.repository";

import { verifyUserEmail } from "@/repositories/user.repository";

type VerifyEmailPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return <InvalidPage />;
  }

  const tokenHash = hashVerificationToken(token);

  const verificationToken = await findVerificationToken(tokenHash);

  if (!verificationToken) {
    return <InvalidPage />;
  }

  if (new Date(verificationToken.expires_at) < new Date()) {
    await deleteVerificationToken(verificationToken.id);

    return <ExpiredPage />;
  }

  await verifyUserEmail(verificationToken.user_id);

  await deleteVerificationToken(verificationToken.id);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="text-6xl">✅</div>

        <h1 className="mt-5 text-3xl font-bold">Email verified</h1>

        <p className="mt-3 text-zinc-600">
          Your account has been successfully activated.
        </p>

        <Link
          href="/login"
          className="mt-8 inline-flex rounded-xl bg-zinc-900 px-6 py-3 font-medium text-white transition hover:bg-zinc-800"
        >
          Continue to login
        </Link>
      </div>
    </main>
  );
}

function InvalidPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold">Invalid verification link</h1>
      </div>
    </main>
  );
}

function ExpiredPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold">Verification link expired</h1>
      </div>
    </main>
  );
}
