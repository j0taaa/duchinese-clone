"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function AuthForm({
  mode,
}: {
  mode: "sign-in" | "sign-up";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setError(null);

    startTransition(async () => {
      const result =
        mode === "sign-up"
          ? await authClient.signUp.email({
              name,
              email,
              password,
            })
          : await authClient.signIn.email({
              email,
              password,
              rememberMe: true,
            });

      if (result.error) {
        setError(result.error.message ?? "Authentication failed.");
        return;
      }

      router.push("/my-library");
      router.refresh();
    });
  }

  return (
    <section className="rounded-[32px] border border-[#ecdcd2] bg-white p-6 shadow-[0_24px_70px_-52px_rgba(92,46,24,0.34)] sm:p-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-[#241815]">
          {mode === "sign-up" ? "Create your account" : "Welcome back"}
        </h2>
        <p className="text-sm leading-6 text-[#6d615b]">
          {mode === "sign-up"
            ? "Use email and password to save stories to your own library."
            : "Sign in to access your stories and generation settings."}
        </p>
      </div>

      <form action={handleSubmit} className="mt-6 space-y-4">
        {mode === "sign-up" ? (
          <Field
            label="Name"
            name="name"
            type="text"
            placeholder="Lin"
            required
          />
        ) : null}
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
        <Field
          label="Password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          required
        />

        {error ? (
          <div className="rounded-2xl border border-[#f2c2bc] bg-[#fff2f0] px-4 py-3 text-sm text-[#a03d34]">
            {error}
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-2xl bg-[#ea4e47] text-white hover:bg-[#dd433d]"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          {mode === "sign-up" ? "Create account" : "Sign in"}
        </Button>
      </form>

      <p className="mt-5 text-sm text-[#72655e]">
        {mode === "sign-up" ? "Already have an account?" : "Need an account?"}{" "}
        <Link
          href={mode === "sign-up" ? "/sign-in" : "/sign-up"}
          prefetch={false}
          className="font-semibold text-[#d34d43]"
        >
          {mode === "sign-up" ? "Sign in" : "Create one"}
        </Link>
      </p>
    </section>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[#4f433d]">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="h-12 w-full rounded-2xl border border-[#e4d8cf] bg-[#fcfaf7] px-4 text-sm text-[#241815] outline-none transition-colors placeholder:text-[#9e928b] focus:border-[#d8b1a6]"
      />
    </label>
  );
}
