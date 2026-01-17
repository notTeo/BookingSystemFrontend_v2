import React, { useCallback, useMemo, useState } from "react";
import "./ResetPasswordPage.css";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../../api/auth";
import { useI18n } from "../../../i18n";
import { getFriendlyError } from "../../../utils/errors";

const RestPasswordPage: React.FC = () => {
  const { t } = useI18n();
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      const value = event.target.value;
      setNewPassword(value);
    },
    [],
  );

  const handleSendForgotPasswordEmail = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setError(null);

      try {
        await resetPassword({
          token,
          newPassword,
        });
        navigate("/login", { replace: true });
      } catch (err) {
        console.error("Unable to sendEmail", err);
        setError(getFriendlyError(err, t, "We couldn't reset your password. Please try again."));
      }
    },
    [newPassword, navigate, token],
  );
  return (
    <div className="app-main__inner">
      <div className="rpe-wrap">
        <div className="card rpe-card">
          <div className="stack-md">
            <div className="stack-sm">
              <h2 className="rpe-title">{t("Create your new password")}</h2>
            </div>

            <div className="field">
              <label htmlFor="password">{t("New password")}</label>
              <input
                id="password"
                className="input"
                type="password"
                name="password"
                placeholder={t("••••••••")}
                autoComplete="email"
                value={newPassword}
                onChange={handleChange}
              />
            </div>

            <div className="rpe-actions">
              <button className="btn btn--primary" type="button" onClick={handleSendForgotPasswordEmail}>
                {t("Save new password")}
              </button>
              <Link to="/" className="btn btn--ghost" type="button">
                {t("Cancel")}
              </Link>
            </div>
            {error ? <p className="rpe-error">{error}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestPasswordPage;
