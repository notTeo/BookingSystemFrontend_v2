import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../../../api/auth";

import "./LoginPage.css"
import { useAuth } from "../../../providers/AuthProvider";

const EMPTY_FORM = { email: "", password: "" } as const;

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
        await refreshUser()
        setStatus("success");
        navigate("/overview", { replace: true });
      } catch (err) {
        console.error("Unable to sign in", err);
        setStatus("error");
        setError(err instanceof Error ? err.message : "Unable to sign in. Try again.");
      }
    },
    [navigate, form.email, form.password],
  );

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

        <button type="submit">
          {status === "pending" ? "Signing in…" : "Sign in"}
        </button>
        {status === "error" && <p className="signin__error">{error}</p>}
      </form>
    </main>
  );
}
