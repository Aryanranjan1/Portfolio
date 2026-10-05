"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

import styles from "./login.module.css";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className={styles.page}><p className={styles.loading}>Loading admin access…</p></main>}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (!result || result.error) {
        setError("Invalid email or password.");
        return;
      }

      window.location.href = result.url ?? "/admin";
    } catch {
      setError("Sign-in failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.visual} aria-label="Portfolio introduction">
        <Image src="/intro.png" alt="" fill preload sizes="(max-width: 767px) 100vw, 50vw" className={styles.image} />
        <div className={styles.visualShade} aria-hidden="true" />
        <Link className={styles.siteLink} href="/">← View website</Link>
        <p className={styles.visualLabel}>PORTFOLIO / CONTROL ROOM</p>
      </section>

      <section className={styles.formSide}>
        <div className={styles.formWrap}>
          <p className={styles.eyebrow}>ADMIN ACCESS</p>
          <h1>Sign in</h1>
          <p className={styles.description}>Sign in to manage your portfolio.</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.field} htmlFor="email">
              <span>Email</span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className={styles.field} htmlFor="password">
              <span>Password</span>
              <span className={styles.passwordRow}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.revealButton}
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </span>
            </label>

            {error && <p className={styles.error} role="alert">{error}</p>}
            <button className={styles.submit} type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
              <span aria-hidden="true">→</span>
            </button>
          </form>

        </div>
      </section>
    </main>
  );
}
