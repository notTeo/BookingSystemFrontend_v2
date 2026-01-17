import React, { useState } from "react";

import { sendInvite } from "../../../../api/shop";
import type { InvitePayload } from "../../../../types/shop";
import { useI18n } from "../../../../i18n";
import { getFriendlyError } from "../../../../utils/errors";

interface InviteFormProps {
  onSent?: () => void;
}

const InviteForm: React.FC<InviteFormProps> = ({ onSent }) => {
  const { t } = useI18n();
  const [form, setForm] = useState<InvitePayload>({
    email: "",
    role: "STAFF",
    message: "",
  });
  const [status, setStatus] = useState<{ loading: boolean; error: string; success: string }>({
    loading: false,
    error: "",
    success: "",
  });

  const updateField = (key: keyof InvitePayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus({ loading: true, error: "", success: "" });

    try {
      await sendInvite({
        email: form.email.trim(),
        role: form.role,
        message: form.message?.trim() || undefined,
      });
      setStatus({ loading: false, error: "", success: t("Invitation sent.") });
      setForm({ email: "", role: "STAFF", message: "" });
      onSent?.();
    } catch (err) {
      const message = getFriendlyError(err, t, "We couldn't send that invite. Please try again.");
      setStatus({ loading: false, error: message, success: "" });
    }
  };

  const roleOptions: Array<{ value: InvitePayload["role"]; label: string; hint: string }> = [
    { value: "MANAGER", label: t("Manager"), hint: t("Can manage settings and services.") },
    { value: "STAFF", label: t("Staff"), hint: t("Can take bookings and manage their schedule.") },
  ];

  return (
    <form className="inviteForm" onSubmit={handleSubmit}>
      <div className="inviteForm__grid">
        <label className="field">
          <span>{t("Email")}</span>
          <input
            required
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder={t("teammate@email.com")}
          />
        </label>

        <label className="field">
          <span>{t("Role")}</span>
          <select
            className="select"
            value={form.role}
            onChange={(e) => updateField("role", e.target.value)}
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <small className="inviteForm__hint">
            {roleOptions.find((r) => r.value === form.role)?.hint}
          </small>
        </label>
      </div>

      <label className="field">
        <span>{t("Message (optional)")}</span>
        <textarea
          className="textarea"
          rows={3}
          value={form.message || ""}
          onChange={(e) => updateField("message", e.target.value)}
          placeholder={t("Add a short welcome note")}
        />
      </label>

      {status.error && (
        <p className="inviteForm__status inviteForm__status--error">{status.error}</p>
      )}
      {status.success && (
        <p className="inviteForm__status inviteForm__status--success">{status.success}</p>
      )}

      <div className="inviteForm__footer">
        <button className="btn btn--primary" type="submit" disabled={status.loading}>
          {status.loading ? t("Sending…") : t("Send invite")}
        </button>
      </div>
    </form>
  );
};

export default InviteForm;
