import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { deleteCurrentUser, updateCurrentUser } from "../../../../api/user";
import { useAuth } from "../../../../providers/AuthProvider";
import type { UpdateUserPayload } from "../../../../types/user";
import "./Account.css";



const Account: React.FC = () => {
  type Theme = "dark" | "light";
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [profileStatus, setProfileStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle",
  );
  const [profileError, setProfileError] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({ password: "", confirm: "" });
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle",
  );
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [deleteForm, setDeleteForm] = useState({ password: "" });
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle",
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);


  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
      });
    }
  }, [user]);

  const fullName = useMemo(() => {
    if (!user) return "";
    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.join(" ");
  }, [user]);

  const handleProfileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    if (profileError) setProfileError(null);
    if (profileStatus === "success") setProfileStatus("idle");
  };

  const handlePasswordChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordError) setPasswordError(null);
    if (passwordStatus === "success") setPasswordStatus("idle");
  };

  const handleProfileSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!user) return;

    setProfileStatus("saving");
    setProfileError(null);

    const payload: UpdateUserPayload = {
      firstName: profileForm.firstName.trim(),
      lastName: profileForm.lastName.trim(),
      email: profileForm.email.trim(),
    };

    try {
      const updated = await updateCurrentUser(payload);
      setUser(updated);
      setProfileStatus("success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update profile.";
      setProfileError(message);
      setProfileStatus("error");
    }
  };
  const handleDeleteChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setDeleteForm({ password: value });
    if (deleteError) setDeleteError(null);
    if (deleteStatus === "success") setDeleteStatus("idle");
  };

  const handleDeleteSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!user) return;

    if (!deleteForm.password.trim()) {
      setDeleteError("Please enter your password to confirm deletion.");
      setDeleteStatus("error");
      return;
    }

    const confirmed = window.confirm(
      "This will permanently delete your account and all data. Are you sure?",
    );

    if (!confirmed) return;

    setDeleteStatus("saving");
    setDeleteError(null);

    try {
      await deleteCurrentUser({ password: deleteForm.password });
      setDeleteStatus("success");
      logout();
      navigate("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to delete account.";
      setDeleteError(message);
      setDeleteStatus("error");
    }
  };


  const handlePasswordSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!user) return;

    if (!passwordForm.password.trim()) {
      setPasswordError("Please enter a new password.");
      setPasswordStatus("error");
      return;
    }

    if (passwordForm.password !== passwordForm.confirm) {
      setPasswordError("Passwords do not match.");
      setPasswordStatus("error");
      return;
    }

    setPasswordStatus("saving");
    setPasswordError(null);

    const payload: UpdateUserPayload = {
      password: passwordForm.password,
    };

    try {
      await updateCurrentUser(payload);
      setPasswordStatus("success");
      setPasswordForm({ password: "", confirm: "" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update password.";
      setPasswordError(message);
      setPasswordStatus("error");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const initialTheme = useMemo<Theme>(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" ? "light" : "dark";
  }, []);

  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme; // sets <html data-theme="...">
    localStorage.setItem("theme", theme);
  }, [theme]);

  if (!user) {
    return (
      <div className="accountPage accountPage--loading">
        <p>Loading account…</p>
      </div>
    );
  }

  return (
    <div className="accountPage">
      <div className="accountPage__inner">
        <header className="accountPage__header">
          <div>
            <p className="accountPage__eyebrow">Settings</p>
            <h1 className="accountPage__title">Account</h1>
            <p className="accountPage__subtitle">
              Update your personal details and keep your account information current.
            </p>
          </div>

          <div className="accountPage__badges">
            <span className="badge badge--primary">{user.subscription} plan</span>
            {user.active === false && <span className="badge">Inactive</span>}
          </div>
        </header>

        <div className="accountPage__grid">
          {/* PROFILE */}
          <section className="card accountPage__card">
            <header className="accountPage__cardHead">
              <div>
                <p className="accountPage__eyebrow">Profile</p>
                <h2>Personal info</h2>
                <p className="accountPage__hint">
                  Control how your details appear across the dashboard.
                </p>
              </div>
              <div className="accountPage__avatar" aria-hidden>
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
            </header>

            <form className="stack-md" onSubmit={handleProfileSubmit}>
              <div className="accountPage__twoCol">
                <div className="field">
                  <label htmlFor="firstName">First name</label>
                  <input
                    className="input"
                    id="firstName"
                    name="firstName"
                    value={profileForm.firstName}
                    onChange={handleProfileChange}
                    autoComplete="given-name"
                    placeholder="Your first name"
                  />
                </div>

                <div className="field">
                  <label htmlFor="lastName">Last name</label>
                  <input
                    className="input"
                    id="lastName"
                    name="lastName"
                    value={profileForm.lastName}
                    onChange={handleProfileChange}
                    autoComplete="family-name"
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  className="input"
                  id="email"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                <p className="accountPage__hint accountPage__hint--inline">
                  This email is used to log in and receive important notifications.
                </p>
              </div>

              {profileError && (
                <p className="accountPage__alert accountPage__alert--error">{profileError}</p>
              )}
              {profileStatus === "success" && (
                <p className="accountPage__alert accountPage__alert--success">Profile updated.</p>
              )}

              <div className="accountPage__actions">
                <button
                  className="btn btn--ghost"
                  type="button"
                  onClick={() =>
                    setProfileForm({
                      firstName: user.firstName ?? "",
                      lastName: user.lastName ?? "",
                      email: user.email ?? "",
                    })
                  }
                  disabled={profileStatus === "saving"}
                >
                  Reset
                </button>
                <button
                  className="btn btn--primary"
                  type="submit"
                  disabled={profileStatus === "saving"}
                >
                  {profileStatus === "saving" ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </section>

          {/* APPEARANCE */}
          <section className="card stack-md">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="stack-sm" style={{ gap: 2 }}>
                <h2 style={{ margin: 0 }}>Appearance</h2>
                <small>Switch between dark and light theme.</small>
                <small>
                  Current theme:{" "}
                  <strong>{theme === "dark" ? "Dark" : "Light"}</strong>
                </small>
              </div>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? "Use light mode" : "Use dark mode"}
              </button>
            </div>
          </section>

          {/* SECURITY / PASSWORD */}
          <section className="card accountPage__card">
            <header className="accountPage__cardHead">
              <div>
                <p className="accountPage__eyebrow">Security</p>
                <h2>Password</h2>
                <p className="accountPage__hint">
                  Use a strong password to help keep your account safe.
                </p>
              </div>
            </header>

            <form className="stack-md" onSubmit={handlePasswordSubmit}>
              <div className="field">
                <label htmlFor="newPassword">New password</label>
                <input
                  className="input"
                  id="newPassword"
                  name="password"
                  type="password"
                  value={passwordForm.password}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              </div>

              <div className="field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  className="input"
                  id="confirmPassword"
                  name="confirm"
                  type="password"
                  value={passwordForm.confirm}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  placeholder="Repeat new password"
                />
              </div>

              {passwordError && (
                <p className="accountPage__alert accountPage__alert--error">
                  {passwordError}
                </p>
              )}
              {passwordStatus === "success" && (
                <p className="accountPage__alert accountPage__alert--success">
                  Password updated.
                </p>
              )}

              <div className="accountPage__actions">
                <button
                  className="btn btn--primary"
                  type="submit"
                  disabled={passwordStatus === "saving"}
                >
                  {passwordStatus === "saving" ? "Updating…" : "Update password"}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* METADATA */}
        <section className="card accountPage__card accountPage__card--wide">
          <header className="accountPage__cardHead">
            <div>
              <p className="accountPage__eyebrow">Account details</p>
              <h2>Metadata</h2>
              <p className="accountPage__hint">Reference information for your account.</p>
            </div>
          </header>

          <dl className="accountPage__metaGrid">
            <div>
              <dt>Full name</dt>
              <dd>{fullName || "-"}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Account ID</dt>
              <dd>#{user.id}</dd>
            </div>
            <div>
              <dt>Joined</dt>
              <dd>{formatDate(user.createdAt)}</dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>{formatDate(user.updatedAt)}</dd>
            </div>
            <div>
              <dt>Subscription</dt>
              <dd className="accountPage__pill">{user.subscription}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd className="accountPage__pill">
                {user.active === false ? "Inactive" : "Active"}
              </dd>
            </div>
          </dl>
        </section>

        {/* DANGER ZONE */}
        <section className="card accountPage__card accountPage__card--danger">
          <header className="accountPage__cardHead">
            <div>
              <p className="accountPage__eyebrow">Danger zone</p>
              <h2>Delete account</h2>
              <p className="accountPage__hint">
                Permanently delete your account and all associated data. This action cannot be
                undone.
              </p>
            </div>
          </header>

          <form className="stack-md" onSubmit={handleDeleteSubmit}>
            <div className="field">
              <label htmlFor="deletePassword">Confirm password</label>
              <input
                className="input"
                id="deletePassword"
                name="deletePassword"
                type="password"
                value={deleteForm.password}
                onChange={handleDeleteChange}
                autoComplete="current-password"
                placeholder="Enter your password to delete"
              />
              <p className="accountPage__hint accountPage__hint--inline">
                For your security, you must enter your current password to delete your account.
              </p>
            </div>

            {deleteError && (
              <p className="accountPage__alert accountPage__alert--error">{deleteError}</p>
            )}
            {deleteStatus === "success" && (
              <p className="accountPage__alert accountPage__alert--success">
                Account deleted. Redirecting…
              </p>
            )}

            <div className="accountPage__actions">
              <button
                type="submit"
                className="btn btn--danger"
                disabled={deleteStatus === "saving"}
              >
                {deleteStatus === "saving" ? "Deleting…" : "Delete account"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Account;
