import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginUser } from "../../../api/auth";
import { useAuth } from "../../../providers/AuthProvider";
import "./LoginPage.css";

const EMPTY_FORM = { email: "", password: "123456789" } as const;

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
      if (error) setError(null);
    },
    [error],
  );

  const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    async (event) => {
      event.preventDefault();

      setStatus("pending");
      setError(null);

      try {
        await loginUser({ email: form.email, password: form.password });
        await refreshUser();
        setStatus("success");
        navigate("/overview", { replace: true });
      } catch (err) {
        console.error("Unable to sign in", err);
        setStatus("error");
        setError(err instanceof Error ? err.message : "Unable to sign in. Try again.");
      }
    },
    [navigate, form.email, form.password, refreshUser],
  );

  const isSubmitting = status === "pending";

  return (
<main className="page page--signin signin">
      <div className="signin__shell">
        {/* LEFT 60% */}
        <section className="signin__left" aria-label="Sign in">
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

            {status === "error" && error && <p className="signin__error">{error}</p>}

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
        </section>

        {/* RIGHT 40% */}
        <aside className="signin__right" aria-label="Product info">
          <div className="signin__rightInner">
            <span className="signin__badge">Built for real shops</span>

            <h2 className="signin__rightTitle">
              One dashboard.
              <br />
              Zero chaos.
            </h2>

            <p className="signin__rightText">
              Manage shops, staff, services, working hours, and bookings — scoped per shop,
              designed to avoid mistakes and double bookings.
            </p>

            <div className="signin__bullets">
              <div className="signin__bullet">
                <span className="signin__dot" />
                <span>Shop calendar + bookings</span>
              </div>
              <div className="signin__bullet">
                <span className="signin__dot" />
                <span>Team & services management</span>
              </div>
              <div className="signin__bullet">
                <span className="signin__dot" />
                <span>Multi-tenant SaaS-ready</span>
              </div>
            </div>

            <div className="signin__rightCta">
              <Link className="btn btn--ghost" to="/pricing">
                View pricing
              </Link>
              <Link className="btn btn--primary" to="/register">
                Start free
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
