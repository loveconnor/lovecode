"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "login" | "signup";

interface AuthFormProps extends React.ComponentProps<"form"> {
  defaultMode?: Mode;
}

export function AuthForm({
  className,
  defaultMode = "login",
  ...props
}: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseBrowserClient();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          throw signInError;
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          throw signUpError;
        }
        if (!data.session) {
          setMessage("Check your email to confirm your account before signing in.");
          return;
        }
      }

      router.push("/");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
    setError(null);
    setMessage(null);
  };

  return (
    <form
      className={cn("flex flex-col gap-6 text-left", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold">
          {mode === "login" ? "Login to your account" : "Create an account"}
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          {mode === "login"
            ? "Enter your email to access your workspace"
            : "Fill in your details to get started"}
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            {mode === "login" && (
              <a
                href="https://supabase.com/dashboard/projects"
                className="ml-auto text-sm underline-offset-4 hover:underline text-primary"
              >
                Forgot your password?
              </a>
            )}
          </div>
          <Input
            id="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-md border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
            {message}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Please wait..." : mode === "login" ? "Login" : "Sign up"}
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="underline underline-offset-4 text-primary"
              onClick={toggleMode}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              className="underline underline-offset-4 text-primary"
              onClick={toggleMode}
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </form>
  );
}

export { AuthForm as LoginForm };
