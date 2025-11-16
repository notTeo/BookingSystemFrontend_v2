import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../../../api/auth";
import { getAccessToken, setAccessToken } from "../../../api/http";
import type { AuthTokens } from "../../../types/auth";

const EMPTY_FORM = { email: "", password: "" } as const;

type FormState = typeof EMPTY_FORM;

type SignInStatus = "idle" | "pending" | "success" | "error";

export default function SignInPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<SignInStatus>("idle");
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const canSubmit = useMemo(() => {
    return Boolean(form.email.trim()) && Boolean(form.password.trim()) && status !== "pending";
  }, [form.email, form.password, status]);

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
      if (!canSubmit) return;

      setStatus("pending");
      setError(null);

      try {
        const nextTokens = await loginUser({
          email: form.email,
          password: form.password,
        });
        setAccessToken(nextTokens.accessToken);
        setTokens(nextTokens);
        setStatus("success");
        navigate("/overview", { replace: true });
      } catch (err) {
        console.error("Unable to sign in", err);
        setStatus("error");
        setError(err instanceof Error ? err.message : "Unable to sign in. Try again.");
      }
    },
    [canSubmit, form.email, form.password],
  );

  useEffect(() => {
    if (!tokens?.accessToken) return;
    console.info("Signed in with token", getAccessToken());
  }, [tokens]);

  return (
    <main className="signin">
      <form className="signin__card" onSubmit={handleSubmit}>
        <h1>Log in</h1>

        <label>
          Email
          <input
            autoComplete="email"
            name="email"
            onChange={handleChange}
            placeholder="you@example.com"
            type="email"
            value={form.email}
          />
        </label>

        <label>
          Password
          <input
            autoComplete="current-password"
            name="password"
            onChange={handleChange}
            placeholder="••••••••"
            type="password"
            value={form.password}
          />
        </label>

        <button disabled={!canSubmit} type="submit">
          {status === "pending" ? "Signing in…" : "Sign in"}
        </button>

        {status === "success" && tokens?.user && (
          <p className="signin__success">
            Welcome back <strong>{tokens.user.firstName ?? tokens.user.email}</strong>
          </p>
        )}
        {status === "error" && <p className="signin__error">{error}</p>}
      </form>
    </main>
  );
}
