import React, { useCallback, useState } from "react";
import "./ResetPasswordPage.css";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../../api/auth";
import { useI18n } from "../../../i18n";
import { getFriendlyError } from "../../../utils/errors";

const RestPasswordEmailPage: React.FC = () => {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      const value = event.target.value;
      setEmail(value);
    },
    [],
  );

  const handleSendForgotPasswordEmail = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setError(null);

      try {
        await forgotPassword({
          email,
        });
      } catch (err) {
        console.error("Unable to sendEmail", err);
        setError(getFriendlyError(err, t, "We couldn't send that reset link. Please try again."));
      }
    },
    [email],
  );
  return (
    <div className="app-main__inner">
      <div className="rpe-wrap">
        <div className="card rpe-card">
          <div className="stack-md">
            <div className="stack-sm">
              <h2 className="rpe-title">{t("Forgot your password?")}</h2>
              <p className="rpe-subtitle">
                {t("Enter your account email and we’ll send you a reset link.")}
              </p>
            </div>

            <div className="field">
              <label htmlFor="email">{t("Email")}</label>
              <input
                id="email"
                className="input"
                type="email"
                name="email"
                placeholder={t("you@example.com")}
                autoComplete="email"
                value={email}
                onChange={handleChange}
              />
              <small className="rpe-hint">
                {t("If an account exists for this email, you’ll receive a message.")}
              </small>
            </div>

            <div className="rpe-actions">
              <button className="btn btn--primary" type="button" onClick={handleSendForgotPasswordEmail}>
                {t("Send reset link")}
              </button>
              <Link to="/" className="btn btn--ghost" type="button">
                {t("Cancel")}
              </Link>
            </div>
            {error ? <p className="rpe-error">{error}</p> : null}

            <div className="rpe-footer">
              <span className="badge">{t("Security")}</span>
              <small>{t("Links expire after a short time for safety.")}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestPasswordEmailPage;
