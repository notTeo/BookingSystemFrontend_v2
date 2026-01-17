import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { deleteCurrentUser, updateCurrentUser } from "../../../../api/user";
import { useAuth } from "../../../../providers/AuthProvider";
import type { UpdateUserPayload } from "../../../../types/user";
import { useI18n } from "../../../../i18n";
import { getFriendlyError } from "../../../../utils/errors";
import "./Account.css";

// -------------------- Local types / helpers --------------------

type Theme = "dark" | "light";

const Account: React.FC = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang, t } = useI18n();

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
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
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
      setProfileError(
        getFriendlyError(err, t, "We couldn't update your profile. Please try again."),
      );
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
      setDeleteError(t("Please enter your password to confirm deletion."));
      setDeleteStatus("error");
      return;
    }

    const confirmed = window.confirm(
      t("This will permanently delete your account and all data. Are you sure?"),
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
      setDeleteError(
        getFriendlyError(err, t, "We couldn't delete your account. Please try again."),
      );
      setDeleteStatus("error");
    }
  };

  const handlePasswordSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!user) return;

    if (!passwordForm.password.trim()) {
      setPasswordError(t("Please enter a new password."));
      setPasswordStatus("error");
      return;
    }

    if (passwordForm.password !== passwordForm.confirm) {
      setPasswordError(t("Passwords do not match."));
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
      setPasswordError(
        getFriendlyError(err, t, "We couldn't update your password. Please try again."),
      );
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
        <p>{t("Loading account…")}</p>
      </div>
    );
  }

  return (
    <div className="accountPage">
      <div className="accountPage__inner">
        <header className="accountPage__header">
          <div>
            <p className="accountPage__eyebrow">{t("Settings")}</p>
            <h1 className="accountPage__title">{t("Account")}</h1>
            <p className="accountPage__subtitle">
              {t("Update your personal details and keep your account information current.")}
            </p>
          </div>
        </header>

        <section className="accountPage__hero">
          <div className="accountPage__heroMain">
            <div className="accountPage__avatar accountPage__avatar--lg" aria-hidden>
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>
            <div className="accountPage__heroInfo">
              <h2 className="accountPage__heroName">{fullName || t("Account")}</h2>
              <p className="accountPage__heroEmail">{user.email}</p>
              <div className="accountPage__badges">
                <span className="badge badge--primary">
                  {user.subscription} {t("plan")}
                </span>
                <span className="badge">{user.active === false ? t("Inactive") : t("Active")}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="accountPage__layout">
          <div className="accountPage__column">
            {/* PROFILE */}
            <section className="accountPage__panel">
            <header className="accountPage__cardHead">
              <div>
                <p className="accountPage__eyebrow">{t("Profile")}</p>
                <h2>{t("Personal info")}</h2>
                <p className="accountPage__hint">
                  {t("Control how your details appear across the dashboard.")}
                </p>
              </div>
            </header>

            <form className="stack-md" onSubmit={handleProfileSubmit}>
              <div className="accountPage__twoCol">
                <div className="field">
                  <label htmlFor="firstName">{t("First name")}</label>
                  <input
                    className="input"
                    id="firstName"
                    name="firstName"
                    value={profileForm.firstName}
                    onChange={handleProfileChange}
                    autoComplete="given-name"
                    placeholder={t("Your first name")}
                  />
                </div>

                <div className="field">
                  <label htmlFor="lastName">{t("Last name")}</label>
                  <input
                    className="input"
                    id="lastName"
                    name="lastName"
                    value={profileForm.lastName}
                    onChange={handleProfileChange}
                    autoComplete="family-name"
                    placeholder={t("Your last name")}
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="email">{t("Email")}</label>
                <input
                  className="input"
                  id="email"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  autoComplete="email"
                  placeholder={t("you@example.com")}
                />
                <p className="accountPage__hint accountPage__hint--inline">
                  {t("This email is used to log in and receive important notifications.")}
                </p>
              </div>

              {profileError && (
                <p className="accountPage__alert accountPage__alert--error">{profileError}</p>
              )}
              {profileStatus === "success" && (
                <p className="accountPage__alert accountPage__alert--success">
                  {t("Profile updated.")}
                </p>
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
                  {t("Reset")}
                </button>
                <button
                  className="btn btn--primary"
                  type="submit"
                  disabled={profileStatus === "saving"}
                >
                  {profileStatus === "saving" ? t("Saving…") : t("Save changes")}
                </button>
              </div>
            </form>
            </section>

            {/* SECURITY / PASSWORD */}
            <section className="accountPage__panel">
            <header className="accountPage__cardHead">
              <div>
                <p className="accountPage__eyebrow">{t("Security")}</p>
                <h2>{t("Password")}</h2>
                <p className="accountPage__hint">
                  {t("Use a strong password to help keep your account safe.")}
                </p>
              </div>
            </header>

            <form className="stack-md" onSubmit={handlePasswordSubmit}>
              <div className="field">
                <label htmlFor="newPassword">{t("New password")}</label>
                <input
                  className="input"
                  id="newPassword"
                  name="password"
                  type="password"
                  value={passwordForm.password}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  placeholder={t("••••••••")}
                />
              </div>

              <div className="field">
                <label htmlFor="confirmPassword">{t("Confirm password")}</label>
                <input
                  className="input"
                  id="confirmPassword"
                  name="confirm"
                  type="password"
                  value={passwordForm.confirm}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  placeholder={t("Repeat new password")}
                />
              </div>

              {passwordError && (
                <p className="accountPage__alert accountPage__alert--error">{passwordError}</p>
              )}
              {passwordStatus === "success" && (
                <p className="accountPage__alert accountPage__alert--success">
                  {t("Password updated.")}
                </p>
              )}

              <div className="accountPage__actions">
                <button
                  className="btn btn--primary"
                  type="submit"
                  disabled={passwordStatus === "saving"}
                >
                  {passwordStatus === "saving" ? t("Updating…") : t("Update password")}
                </button>
              </div>
            </form>
            </section>
          </div>

          <div className="accountPage__column">
            {/* APPEARANCE */}
            <section className="accountPage__panel accountPage__panel--compact">
            <header className="accountPage__cardHead accountPage__cardHead--split">
              <div>
                <p className="accountPage__eyebrow">{t("Appearance")}</p>
                <h2>{t("Theme")}</h2>
                <p className="accountPage__hint">{t("Switch between dark and light theme.")}</p>
                <p className="accountPage__hint accountPage__hint--inline">
                  {t("Current theme:")}{" "}
                  <strong>{theme === "dark" ? t("Dark") : t("Light")}</strong>
                </p>
              </div>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                aria-label={t("Toggle theme")}
              >
                {theme === "dark" ? t("Use light mode") : t("Use dark mode")}
              </button>
            </header>
            </section>

            <section className="accountPage__panel accountPage__panel--compact">
            <header className="accountPage__cardHead accountPage__cardHead--split">
              <div>
                <p className="accountPage__eyebrow">{t("Language")}</p>
                <h2>{t("Language")}</h2>
                <p className="accountPage__hint">{t("Choose the language for the interface.")}</p>
              </div>
              <div className="accountPage__lang">
                <button
                  type="button"
                  className={`accountPage__langBtn ${lang === "en" ? "is-active" : ""}`}
                  onClick={() => setLang("en")}
                  aria-pressed={lang === "en"}
                >
                  🇬🇧 {t("English")}
                </button>
                <button
                  type="button"
                  className={`accountPage__langBtn ${lang === "el" ? "is-active" : ""}`}
                  onClick={() => setLang("el")}
                  aria-pressed={lang === "el"}
                >
                  🇬🇷 {t("Greek")}
                </button>
              </div>
            </header>
            </section>

            {/* METADATA */}
            <section className="accountPage__panel">
          <header className="accountPage__cardHead">
            <div>
              <p className="accountPage__eyebrow">{t("Account details")}</p>
              <h2>{t("Metadata")}</h2>
              <p className="accountPage__hint">{t("Reference information for your account.")}</p>
            </div>
          </header>

          <dl className="accountPage__metaGrid">
            <div>
              <dt>{t("Full name")}</dt>
              <dd>{fullName || "-"}</dd>
            </div>
            <div>
              <dt>{t("Email")}</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>{t("Account ID")}</dt>
              <dd>#{user.id}</dd>
            </div>
            <div>
              <dt>{t("Joined")}</dt>
              <dd>{formatDate(user.createdAt)}</dd>
            </div>
            <div>
              <dt>{t("Last updated")}</dt>
              <dd>{formatDate(user.updatedAt)}</dd>
            </div>
            <div>
              <dt>{t("Subscription")}</dt>
              <dd className="accountPage__pill">{user.subscription}</dd>
            </div>
            <div>
              <dt>{t("Status")}</dt>
              <dd className="accountPage__pill">
                {user.active === false ? t("Inactive") : t("Active")}
              </dd>
            </div>
          </dl>
            </section>
          </div>
        </div>

        {/* DANGER ZONE */}
        <section className="accountPage__panel accountPage__panel--danger">
          <header className="accountPage__cardHead">
            <div>
              <h2>{t("Delete account")}</h2>
              <p className="accountPage__hint">
                {t(
                  "Permanently delete your account and all associated data. This action cannot be undone.",
                )}
              </p>
            </div>
          </header>

          <form className="stack-md" onSubmit={handleDeleteSubmit}>
            <div className="field">
              <label htmlFor="deletePassword">{t("Confirm password")}</label>
              <input
                className="input"
                id="deletePassword"
                name="deletePassword"
                type="password"
                value={deleteForm.password}
                onChange={handleDeleteChange}
                autoComplete="current-password"
                placeholder={t("Enter your password to delete")}
              />
              <p className="accountPage__hint accountPage__hint--inline">
                {t("For your security, you must enter your current password to delete your account.")}
              </p>
            </div>

            {deleteError && (
              <p className="accountPage__alert accountPage__alert--error">{deleteError}</p>
            )}
            {deleteStatus === "success" && (
              <p className="accountPage__alert accountPage__alert--success">
                {t("Account deleted. Redirecting…")}
              </p>
            )}

            <div className="accountPage__actions accountPage__actions--danger">
              <button
                type="submit"
                className="btn--danger"
                disabled={deleteStatus === "saving"}
              >
                {deleteStatus === "saving" ? t("Deleting…") : t("Delete account")}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Account;
