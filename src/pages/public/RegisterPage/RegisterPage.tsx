import React from "react";
import "./RegisterPage.css";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../../../api/auth";
import { useAuth } from "../../../providers/AuthProvider";

const EMPTY_FORM = { firstName: "", lastName: "", email: "", password: "",confirmPassword: "", subscription: "MEMBER"} as const;

type FormState = typeof EMPTY_FORM;

type RegisterStatus = "idle" | "pending" | "success" | "error";

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<RegisterStatus>("idle");
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
         await registerUser({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          subscription: form.subscription,
         });
         await refreshUser()
        setStatus("success");
        navigate("/overview", { replace: true });
      } catch (err) {
        console.error("Unable to sign in", err);
        setStatus("error");
        setError(err instanceof Error ? err.message : "Unable to register. Try again.");
      }
    },
    [navigate, form.firstName, form.lastName, form.email, form.password, form.confirmPassword, form.subscription],
  );



  return (
    <main className="signin">
      <form className="signin__card" onSubmit={handleSubmit}>
        <h1>Register</h1>

        <label>
        First Name 
          <input
            autoComplete="firstName"
            name="firstName"
            onChange={handleChange}
            placeholder="your first name"
            type="firstName"
            value={form.firstName}
          />
        </label>

        <label>
          Last Name 
          <input
            autoComplete="lastName"
            name="lastName"
            onChange={handleChange}
            placeholder="your last name"
            type="lastName"
            value={form.lastName}
          />
        </label>

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
        <label>
          Confirm Password
          <input
            autoComplete="current-password"
            name="confirmPassword"
            onChange={handleChange}
            placeholder="••••••••"
            type="confirmPassword"
            value={form.confirmPassword}
          />
        </label>
        <label>
          Subscription
          <select id="subscription-select">
            <option value=""></option>
            <option value="MEMBER">MEMBER</option>
            <option value="STARTER">STARTER</option>
            <option value="PRO">PRO</option>
        </select>
        </label>

        <button type="submit">
          {status === "pending" ? "Registering..." : "Registered"}
        </button>
        {status === "error" && <p className="signin__error">{error}</p>}
      </form>
    </main>
  );
};

export default RegisterPage;
