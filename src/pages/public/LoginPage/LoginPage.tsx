import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginUser } from "../../../api/auth";

import "./LoginPage.css";
import { useAuth } from "../../../providers/AuthProvider";
import { clearAuthCookies } from "../../../api/http";

const EMPTY_FORM = { email: "", password: "Passw0rd!23" } as const;

type FormState = typeof EMPTY_FORM;

type SignInStatus = "idle" | "pending" | "success" | "error";

export default function SignInPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<SignInStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      const { name, value } = event.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      if (error) {
        setError(null);
      }
    },
    [error],
  );

  const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    async (event) => {
      event.preventDefault();

      setStatus("pending");
      setError(null);

      try {
        await loginUser({
          email: form.email,
          password: form.password,
        });
        await refreshUser();
        setStatus("success");
        navigate("/overview", { replace: true });
      } catch (err) {
        clearAuthCookies()
        console.error("Unable to sign in", err);
        setStatus("error");
        setError(
          err instanceof Error ? err.message : "Unable to sign in. Try again.",
        );
      }
    },
    [navigate, form.email, form.password, refreshUser],
  );

  const isSubmitting = status === "pending";

  return (
    <main className="signin">
      <form className="signin__card stack-md" onSubmit={handleSubmit}>
        <header className="signin__header stack-sm">
          <h1 className="signin__title">Log in</h1>
          <p className="signin__subtitle">
            Welcome back. Enter your details to access your dashboard.
          </p>
        </header>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            className="input"
            id="email"
            autoComplete="email"
            name="email"
            onChange={handleChange}
            placeholder="you@example.com"
            type="email"
            value={form.email}
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            className="input"
            id="password"
            autoComplete="current-password"
            name="password"
            onChange={handleChange}
            placeholder="••••••••"
            type="password"
            value={form.password}
          />
        </div>

        {status === "error" && error && (
          <p className="signin__error">{error}</p>
        )}

        <button
          type="submit"
          className="btn btn--primary btn--full signin__btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>

        <p className="signin__footer">
          <span>Don&apos;t have an account?</span>
          <Link to="/register">Create one</Link>
        </p>
      </form>
    </main>
  );
}
