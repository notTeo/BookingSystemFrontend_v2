import React, { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./RegisterPage.css";
import { registerUser } from "../../../api/auth";
import { useAuth } from "../../../providers/AuthProvider";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  subscription: "MEMBER",
} as const;

type FormState = typeof EMPTY_FORM;

type RegisterStatus = "idle" | "pending" | "success" | "error";

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<RegisterStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>>(
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
        await registerUser({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          subscription: form.subscription,
        });

        await refreshUser();
        setStatus("success");
        navigate("/overview", { replace: true });
      } catch (err) {
        console.error("Unable to register", err);
        setStatus("error");
        setError(err instanceof Error ? err.message : "Unable to register. Try again.");
      }
    },
    [
      navigate,
      form.firstName,
      form.lastName,
      form.email,
      form.password,
      form.confirmPassword,
      form.subscription,
      refreshUser,
    ],
  );

  const isSubmitting = status === "pending";

  return (
    <main className="signin">
      <div className="signin__shell signin__shell--register">
        {/* LEFT (40%): info */}
        <aside className="signin__right signin__right--left">
          <div className="signin__rightInner">
            <span className="signin__badge">Get started</span>

            <h2 className="signin__rightTitle">Create your account in 30 seconds</h2>

            <p className="signin__rightText">
              Set up your shop, add your team, and start taking bookings with a clean dashboard and
              a customer-friendly booking flow.
            </p>

            <div className="signin__bullets">
              <div className="signin__bullet">
                <span className="signin__dot" />
                Multi-shop support
              </div>
              <div className="signin__bullet">
                <span className="signin__dot" />
                Calendar + services + staff
              </div>
              <div className="signin__bullet">
                <span className="signin__dot" />
                Subscription ready from day one
              </div>
            </div>

            <div className="signin__rightCta">
              <Link className="btn btn--ghost" to="/login">
                Already have an account?
              </Link>
            </div>
          </div>
        </aside>

        {/* RIGHT (60%): form */}
        <section className="signin__left signin__left--right">
          <form className="signin__card stack-md" onSubmit={handleSubmit}>
            <header className="signin__header stack-sm">
              <h1 className="signin__title">Create an account</h1>
              <p className="signin__subtitle">
                Set up your account to start managing your shops and bookings.
              </p>
            </header>

            <div className="signin__grid2">
              <div className="field">
                <label htmlFor="firstName">First name</label>
                <input
                  className="input"
                  id="firstName"
                  autoComplete="given-name"
                  name="firstName"
                  onChange={handleChange}
                  placeholder="Your first name"
                  type="text"
                  value={form.firstName}
                />
              </div>

              <div className="field">
                <label htmlFor="lastName">Last name</label>
                <input
                  className="input"
                  id="lastName"
                  autoComplete="family-name"
                  name="lastName"
                  onChange={handleChange}
                  placeholder="Your last name"
                  type="text"
                  value={form.lastName}
                />
              </div>
            </div>

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

            <div className="signin__grid2">
              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  className="input"
                  id="password"
                  autoComplete="new-password"
                  name="password"
                  onChange={handleChange}
                  placeholder="••••••••"
                  type="password"
                  value={form.password}
                />
              </div>

              <div className="field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  className="input"
                  id="confirmPassword"
                  autoComplete="new-password"
                  name="confirmPassword"
                  onChange={handleChange}
                  placeholder="••••••••"
                  type="password"
                  value={form.confirmPassword}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="subscription">Subscription</label>
              <select
                className="select"
                id="subscription"
                name="subscription"
                value={form.subscription}
                onChange={handleChange}
              >
                <option value="MEMBER">MEMBER</option>
                <option value="STARTER">STARTER</option>
                <option value="PRO">PRO</option>
              </select>
            </div>

            {status === "error" && error && <p className="signin__error">{error}</p>}

            <button
              type="submit"
              className="btn btn--primary btn--full signin__btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>

            <p className="signin__footer">
              <span>Already have an account?</span>
              <Link to="/login">Log in</Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
};

export default RegisterPage;
