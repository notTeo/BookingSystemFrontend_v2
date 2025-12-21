// src/pages/auth/register/RegisterPage.tsx
import React, { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "./RegisterPage.css";
import { preRegisterUser } from "../../../api/auth";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  subscription: "MEMBER",
} as const;

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  subscription: "MEMBER" | "STARTER" | "PRO";
};

type StepKey = "email" | "password" | "verify";
type SubmitStatus = "idle" | "pending" | "success" | "error";

function isEmailLike(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM as unknown as FormState);
  const [step, setStep] = useState<StepKey>("email");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const isSubmitting = status === "pending";

  const stepIndex = useMemo(() => {
    if (step === "email") return 0;
    if (step === "password") return 1;
    return 2;
  }, [step]);

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>>(
    (event) => {
      const { name, value } = event.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      if (error) setError(null);
    },
    [error],
  );

  const validateEmailStep = useCallback((): string | null => {
    if (!form.firstName.trim() || form.firstName.trim().length < 2) return "First name is required.";
    if (!form.lastName.trim() || form.lastName.trim().length < 2) return "Last name is required.";
    if (!isEmailLike(form.email)) return "Enter a valid email.";
    if (!form.subscription) return "Choose a subscription.";
    return null;
  }, [form.firstName, form.lastName, form.email, form.subscription]);

  const validatePasswordStep = useCallback((): string | null => {
    if (!form.password || form.password.length < 8) return "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  }, [form.password, form.confirmPassword]);

  const goNext = useCallback(() => {
    setError(null);

    if (step === "email") {
      const msg = validateEmailStep();
      if (msg) return setError(msg);
      setStep("password");
      return;
    }

    if (step === "password") {
      const msg = validatePasswordStep();
      if (msg) return setError(msg);
      setStep("verify");
      return;
    }
  }, [step, validateEmailStep, validatePasswordStep]);

  const goBack = useCallback(() => {
    setError(null);

    if (step === "password") setStep("email");
    else if (step === "verify") setStep("password");
  }, [step]);

  const handleSendVerification = useCallback(async () => {
    setStatus("pending");
    setError(null);

    const msg1 = validateEmailStep();
    if (msg1) {
      setStatus("idle");
      setError(msg1);
      return;
    }

    const msg2 = validatePasswordStep();
    if (msg2) {
      setStatus("idle");
      setError(msg2);
      return;
    }

    try {
      await preRegisterUser({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        subscription: form.subscription,
      });

      setStatus("success");
    } catch (err) {
      console.error("Unable to pre-register", err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to send verification email. Try again.");
    }
  }, [form, validateEmailStep, validatePasswordStep]);

  return (
    <main className="signin">
      <div className="signin__shell signin__shell--register">
        {/* LEFT (40%): info */}
        <aside className="signin__right signin__right--left">
          <div className="signin__rightInner">
            <span className="signin__badge">Get started</span>

            <h2 className="signin__rightTitle">Create your account</h2>

            <p className="signin__rightText">
              You’ll confirm your email before your account is created. After verification, you’ll
              land in your overview.
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

        {/* RIGHT (60%): wizard */}
        <section className="signin__left signin__left--right">
          <div className="signin__card stack-md">
            <header className="signin__header stack-sm">
              <h1 className="signin__title">Register</h1>
              <p className="signin__subtitle">Step {stepIndex + 1} of 3</p>

              <div className="wizard__steps" aria-hidden="true">
                <div className={`wizard__dot ${stepIndex >= 0 ? "is-active" : ""}`} />
                <div className={`wizard__dot ${stepIndex >= 1 ? "is-active" : ""}`} />
                <div className={`wizard__dot ${stepIndex >= 2 ? "is-active" : ""}`} />
              </div>
            </header>

            {step === "email" && (
              <div className="stack-md">
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                </div>

                <div className="field">
                  <label htmlFor="subscription">Subscription</label>
                  <select
                    className="select"
                    id="subscription"
                    name="subscription"
                    value={form.subscription}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="STARTER">STARTER</option>
                    <option value="PRO">PRO</option>
                  </select>
                </div>
              </div>
            )}

            {step === "password" && (
              <div className="stack-md">
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <p className="wizard__hint">
                  Next step will send a verification email to the address you provided.
                </p>
              </div>
            )}

            {step === "verify" && (
              <div className="stack-md">
                <div className="field">
                  <label htmlFor="verifyEmail">Email</label>
                  <input
                    className="input"
                    id="verifyEmail"
                    name="verifyEmail"
                    value={form.email}
                    readOnly
                  />
                </div>

                {status === "success" ? (
                  <div className="wizard__success stack-sm">
                    <p className="wizard__successTitle">Verification email sent.</p>
                    <p className="wizard__successText">
                      Open your email and click the verification button. After verification you will
                      be redirected to <code>/overview</code>.
                    </p>

                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={handleSendVerification}
                      disabled={isSubmitting}
                    >
                      Resend email
                    </button>
                  </div>
                ) : (
                  <div className="stack-sm">
                    <p className="wizard__hint">
                      Click the button to send the verification email.
                    </p>

                    <button
                      type="button"
                      className="btn btn--primary btn--full signin__btn"
                      onClick={handleSendVerification}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send verification email"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {error && <p className="signin__error">{error}</p>}

            <div className="wizard__actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={goBack}
                disabled={isSubmitting || step === "email"}
              >
                Back
              </button>

              {step !== "verify" ? (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={goNext}
                  disabled={isSubmitting}
                >
                  Next
                </button>
              ) : (
                <Link className="wizard__loginLink" to="/login">
                  Already verified? Log in
                </Link>
              )}
            </div>

            <p className="signin__footer">
              <span>Already have an account?</span>
              <Link to="/login">Log in</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default RegisterPage;
