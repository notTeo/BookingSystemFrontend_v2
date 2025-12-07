import React, { useState } from "react";

import { sendInvite } from "../../../../api/shop";
import type { InvitePayload } from "../../../../types/shop";

interface InviteFormProps {
  onSent?: () => void;
}

const roleOptions: Array<{ value: InvitePayload["role"]; label: string; hint: string }> = [
  { value: "MANAGER", label: "Manager", hint: "Can manage settings and services." },
  { value: "STAFF", label: "Staff", hint: "Can take bookings and manage their schedule." },
];

const InviteForm: React.FC<InviteFormProps> = ({ onSent }) => {
  const [form, setForm] = useState<InvitePayload>({
    email: "",
    role: "STAFF",
    message: "",
  });
  const [status, setStatus] = useState<{ loading: boolean; error: string; success: string }>(
    {
      loading: false,
      error: "",
      success: "",
    },
  );

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
      setStatus({ loading: false, error: "", success: "Invitation sent." });
      setForm({ email: "", role: "STAFF", message: "" });
      onSent?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send invite.";
      setStatus({ loading: false, error: message, success: "" });
    }
  };

  return (
    <form className="inviteForm" onSubmit={handleSubmit}>
      <div className="inviteForm__grid">
        <label className="field">
          <span>Email</span>
          <input
            required
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="teammate@email.com"
          />
        </label>

        <label className="field">
          <span>Role</span>
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
        <span>Message (optional)</span>
        <textarea
          className="textarea"
          rows={3}
          value={form.message || ""}
          onChange={(e) => updateField("message", e.target.value)}
          placeholder="Add a short welcome note"
        />
      </label>

      {status.error && <p className="inviteForm__status inviteForm__status--error">{status.error}</p>}
      {status.success && <p className="inviteForm__status inviteForm__status--success">{status.success}</p>}

      <div className="inviteForm__footer">
        <button className="btn btn--primary" type="submit" disabled={status.loading}>
          {status.loading ? "Sending…" : "Send invite"}
        </button>
      </div>
    </form>
  );
};

export default InviteForm;