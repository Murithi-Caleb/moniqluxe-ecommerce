"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth, firebaseConfigError } from "@/lib/firebase";

const authErrorMessages = {
  "auth/email-already-in-use": "An account already exists for this email. Try logging in instead.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/invalid-credential": "The email or password is incorrect. Please try again.",
  "auth/user-not-found": "The email or password is incorrect. Please try again.",
  "auth/wrong-password": "The email or password is incorrect. Please try again.",
  "auth/weak-password": "Choose a stronger password with at least 8 characters.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "We couldn't connect. Check your internet connection and try again.",
  "auth/operation-not-allowed": "Email and password sign-in is not enabled for this Firebase project.",
};

function getAuthErrorMessage(error) {
  if (error instanceof Error && error.message === "Firebase Authentication is not configured.") {
    return "Account sign-in is unavailable until Firebase is configured. Please contact the store for help.";
  }

  return (
    authErrorMessages[error?.code] ||
    "We couldn't complete that request. Please try again."
  );
}

export default function AuthForm({ mode }) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const emailRef = useRef(null);
  const { user, isLoading, signIn, signUp, resetPassword } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    if (isSignup && !name.trim()) {
      setErrorMessage("Enter your name so we know how to address you.");
      return;
    }

    if (isSignup && password !== confirmPassword) {
      setErrorMessage("Your passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSignup) {
        await signUp(name.trim(), email.trim().toLowerCase(), password);
      } else {
        await signIn(email.trim().toLowerCase(), password);
      }
      router.replace("/");
    } catch (error) {
      console.error(`Unable to ${isSignup ? "create an account" : "sign in"}.`, error);
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    setErrorMessage("");
    setStatusMessage("");

    if (!emailRef.current?.checkValidity()) {
      emailRef.current?.reportValidity();
      return;
    }

    setIsResetting(true);
    try {
      await resetPassword(email.trim().toLowerCase());
      setStatusMessage(
        "If an account exists for this email, a password reset link is on its way.",
      );
    } catch (error) {
      console.error("Unable to send a password reset email.", error);
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center px-5 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#171614] shadow-2xl shadow-black/30 lg:grid-cols-[1fr_1.05fr]">
        <section className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden bg-[#2a2118] p-10 lg:flex xl:p-14">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_20%,rgba(213,184,117,0.24),transparent_42%),radial-gradient(ellipse_at_90%_85%,rgba(111,71,46,0.48),transparent_50%)]"
          />
          <div className="relative">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#e7d29e]">
              <Sparkles aria-hidden="true" size={14} />
              A little more you
            </p>
            <h1 className="mt-10 max-w-sm text-5xl font-light leading-[1.15] text-white xl:text-6xl">
              {isSignup ? "Find your own kind of lovely." : "Welcome back to your kind of lovely."}
            </h1>
          </div>
          <div className="relative border-t border-white/15 pt-6">
            <p className="max-w-sm text-sm leading-7 text-white/65">
              Thoughtfully chosen pieces, a more personal experience, and the
              little details that make everyday feel special.
            </p>
            <p className="mt-5 text-xs uppercase tracking-[0.18em] text-white/40">
              MONIQ☆LUXE · Curated with intention
            </p>
          </div>
        </section>

        <section className="px-6 py-9 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
          <div className="mx-auto max-w-md">
            <p className="text-xs uppercase tracking-[0.22em] text-[#d5b875] lg:hidden">
              MONIQ☆LUXE
            </p>
            <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-full border border-[#d5b875]/25 bg-[#d5b875]/10 text-[#e7d29e]">
              <LockKeyhole aria-hidden="true" size={19} />
            </div>
            <h2 className="mt-6 text-3xl font-light text-white sm:text-4xl">
              {isSignup ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/55">
              {isSignup
                ? "Join us for a more personal way to discover the collection."
                : "Sign in to continue your Moniq☆Luxe experience."}
            </p>

            {isLoading ? (
              <p className="mt-9 text-sm text-white/55" aria-live="polite">
                Checking your account…
              </p>
            ) : user ? (
              <div className="mt-9 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm leading-6 text-white/75">
                  You&apos;re already signed in
                  {user.displayName ? ` as ${user.displayName}` : ""}.
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-flex rounded-full bg-[#d5b875] px-5 py-2.5 text-sm font-semibold text-[#181612] transition hover:bg-[#e4ca8f]"
                >
                  Explore the collection
                </Link>
              </div>
            ) : (
              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                {firebaseConfigError && (
                  <p
                    className="rounded-xl border border-rose-300/20 bg-rose-300/5 p-3 text-sm leading-6 text-rose-100/80"
                    role="alert"
                  >
                    Firebase setup is incomplete: {firebaseConfigError.message}
                  </p>
                )}
                {!auth && !firebaseConfigError && (
                  <p
                    className="rounded-xl border border-[#d5b875]/20 bg-[#d5b875]/5 p-3 text-sm leading-6 text-[#e7d29e]/85"
                    role="status"
                  >
                    Account access is unavailable in this preview because
                    Firebase has not been configured. You can still browse the
                    collection.
                  </p>
                )}
                {errorMessage && (
                  <p
                    className="rounded-xl border border-rose-300/20 bg-rose-300/5 p-3 text-sm leading-6 text-rose-100/80"
                    role="alert"
                  >
                    {errorMessage}
                  </p>
                )}
                {statusMessage && (
                  <p
                    className="rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-3 text-sm leading-6 text-emerald-100/80"
                    role="status"
                  >
                    {statusMessage}
                  </p>
                )}

                {isSignup && (
                  <div>
                    <label htmlFor="auth-name" className="mb-2 block text-sm text-white/75">
                      Your name
                    </label>
                    <input
                      id="auth-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      maxLength={80}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-[#100f0d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#d5b875] focus:ring-2 focus:ring-[#d5b875]/20"
                      placeholder="How should we address you?"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="auth-email" className="mb-2 block text-sm text-white/75">
                    Email address
                  </label>
                  <input
                    ref={emailRef}
                    id="auth-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    maxLength={254}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#100f0d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#d5b875] focus:ring-2 focus:ring-[#d5b875]/20"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="auth-password" className="mb-2 block text-sm text-white/75">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-password"
                      name="password"
                      type={isPasswordVisible ? "text" : "password"}
                      autoComplete={isSignup ? "new-password" : "current-password"}
                      minLength={isSignup ? 8 : undefined}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-[#100f0d] px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#d5b875] focus:ring-2 focus:ring-[#d5b875]/20"
                      placeholder={isSignup ? "At least 8 characters" : "Your password"}
                    />
                    <button
                      type="button"
                      aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                      aria-pressed={isPasswordVisible}
                      onClick={() => setIsPasswordVisible((visible) => !visible)}
                      className="absolute inset-y-0 right-0 inline-flex items-center px-4 text-white/45 transition hover:text-white focus-visible:outline-2 focus-visible:outline-[#d5b875]"
                    >
                      {isPasswordVisible ? (
                        <EyeOff aria-hidden="true" size={17} />
                      ) : (
                        <Eye aria-hidden="true" size={17} />
                      )}
                    </button>
                  </div>
                  {isSignup && (
                    <p className="mt-2 text-xs leading-5 text-white/40">
                      Use at least 8 characters for a stronger password.
                    </p>
                  )}
                </div>

                {isSignup && (
                  <div>
                    <label htmlFor="auth-confirm-password" className="mb-2 block text-sm text-white/75">
                      Confirm password
                    </label>
                    <input
                      id="auth-confirm-password"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-[#100f0d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#d5b875] focus:ring-2 focus:ring-[#d5b875]/20"
                      placeholder="Enter your password again"
                    />
                  </div>
                )}

                {!isSignup && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                          disabled={isResetting || !auth}
                      className="text-sm text-[#e7d29e] underline-offset-4 transition hover:underline disabled:cursor-wait disabled:opacity-60"
                    >
                      {isResetting ? "Sending link…" : "Forgot password?"}
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || isResetting || !auth}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#d5b875] px-5 py-3 text-sm font-semibold text-[#181612] transition hover:bg-[#e4ca8f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d5b875] disabled:cursor-wait disabled:opacity-60"
                >
                  {isSubmitting
                    ? isSignup
                      ? "Creating your account…"
                      : "Signing you in…"
                    : isSignup
                      ? "Create account"
                      : "Log in"}
                </button>

                <p className="pt-1 text-center text-sm text-white/50">
                  {isSignup ? "Already have an account?" : "New to Moniq☆Luxe?"}{" "}
                  <Link
                    href={isSignup ? "/login" : "/signup"}
                    className="font-medium text-[#e7d29e] underline-offset-4 hover:underline"
                  >
                    {isSignup ? "Log in" : "Create an account"}
                  </Link>
                </p>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
