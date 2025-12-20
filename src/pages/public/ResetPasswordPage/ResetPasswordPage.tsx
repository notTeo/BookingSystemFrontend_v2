import React, { useCallback, useMemo, useState } from "react";
import "./ResetPasswordPage.css";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../../api/auth";

const RestPasswordPage: React.FC = () => {

  const [newPassword, setNewPassword] = useState("")
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      const value = event.target.value;
      setNewPassword(value);
    },
    []
  );

  const handleSendForgotPasswordEmail = useCallback(
    async (event:any) => {
      event.preventDefault();

      try {
          await resetPassword({
            token,
            newPassword
          });
          navigate("/login", { replace: true });
      } catch (err) {
        console.error("Unable to sendEmail", err);
      }
    },[newPassword]
  )
  return (

        <div className="app-main__inner">
          <div className="rpe-wrap">
            <div className="card rpe-card">
              <div className="stack-md">
                <div className="stack-sm">
                  <h2 className="rpe-title">Create your new password</h2>
                </div>

                <div className="field">
                  <label htmlFor="password">New Password</label>
                  <input
                    id="password"
                    className="input"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                autoComplete="email"
                value={newPassword}
                onChange={handleChange}
                  />
                </div>

                <div className="rpe-actions">
              <button className="btn btn--primary" type="button" onClick={
                handleSendForgotPasswordEmail
              }>
                    Save new password
                  </button>
                  <Link to="/" className="btn btn--ghost" type="button">
                    Cancel
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
  );
};

export default RestPasswordPage;
