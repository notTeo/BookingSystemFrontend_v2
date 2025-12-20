import React, { useCallback, useState } from "react";
import "./ResetPasswordPage.css";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../../api/auth";

const RestPasswordEmailPage: React.FC = () => {

  const [email, setEmail] = useState("")

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      const value = event.target.value;
      setEmail(value);
    },
    []
  );

  const handleSendForgotPasswordEmail = useCallback(
    async (event:any) => {
      event.preventDefault();

      try {
        await forgotPassword({
          email
        });
      } catch (err) {
        console.error("Unable to sendEmail", err);
      }
    },[email]
  )
  return (

        <div className="app-main__inner">
          <div className="rpe-wrap">
            <div className="card rpe-card">
              <div className="stack-md">
                <div className="stack-sm">
                  <h2 className="rpe-title">Forgot your password?</h2>
                  <p className="rpe-subtitle">
                    Enter your account email and we’ll send you a reset link.
                  </p>
                </div>

                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    className="input"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={handleChange}
                  />
                  <small className="rpe-hint">
                    If an account exists for this email, you’ll receive a message.
                  </small>
                </div>

                <div className="rpe-actions">
              <button className="btn btn--primary" type="button" onClick={
                handleSendForgotPasswordEmail
              }>
                    Send reset link
                  </button>
                  <Link to="/" className="btn btn--ghost" type="button">
                    Cancel
                  </Link>
                </div>

                <div className="rpe-footer">
                  <span className="badge">Security</span>
                  <small>Links expire after a short time for safety.</small>
            </div>
              </div>
            </div>
          </div>
        </div>
  );
};

export default RestPasswordEmailPage;
