import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createShop } from "../../../../api/shop";
import { setActiveShopId } from "../../../../api/http";
import { useAuth } from "../../../../providers/AuthProvider";
import { useShop } from "../../../../providers/ShopProvider";
import type { CreateShopPayload } from "../../../../types/shop";

import "./CreateShop.css";

type FormState = {
  name: string;
  address: string;
  timezone: string;
  bookingUrl: string;
  phone: string;
  website: string;
  description: string;
  allowWalkIns: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  address: "",
  timezone: "",
  bookingUrl: "",
  phone: "",
  website: "",
  description: "",
  allowWalkIns: true,
};

const DEFAULT_OPENING_HOURS: CreateShopPayload["openingHours"] = [
  {
    dayOfWeek: "MONDAY",
    openTime: "09:00",
    closeTime: "17:00",
    isClosed: false,
  },
  {
    dayOfWeek: "TUESDAY",
    openTime: "09:00",
    closeTime: "17:00",
    isClosed: false,
  },
  {
    dayOfWeek: "WEDNESDAY",
    openTime: "09:00",
    closeTime: "17:00",
    isClosed: false,
  },
  {
    dayOfWeek: "THURSDAY",
    openTime: "09:00",
    closeTime: "17:00",
    isClosed: false,
  },
  {
    dayOfWeek: "FRIDAY",
    openTime: "09:00",
    closeTime: "17:00",
    isClosed: false,
  },
  {
    dayOfWeek: "SATURDAY",
    openTime: "10:00",
    closeTime: "14:00",
    isClosed: false,
  },
  {
    dayOfWeek: "SUNDAY",
    openTime: "00:00",
    closeTime: "00:00",
    isClosed: true,
  },
];

const CreateShop: React.FC = () => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { refreshShop } = useShop();

  const handleChange = useCallback<
    React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  >(
    (event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const { name, value } = target;

      const nextValue =
        target instanceof HTMLInputElement && target.type === "checkbox"
          ? target.checked
          : value;

      setForm((prev) => ({
        ...prev,
        [name]: nextValue,
      }));
      if (status !== "idle") setStatus("idle");
      if (error) setError(null);
    },
    [status, error],
  );

  const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    async (event) => {
      event.preventDefault();
      if (!form.name.trim()) {
        setStatus("error");
        setError("Please add a shop name to continue.");
        return;
      }

      setStatus("pending");
      setError(null);

      try {
        const payload: CreateShopPayload = {
          name: form.name.trim(),
          address: form.address.trim() || null,
          openingHours: DEFAULT_OPENING_HOURS,
        };

        const created = await createShop(payload);
        setActiveShopId(created.id);
        await refreshUser();
        await refreshShop();
        setStatus("success");
        navigate(`/shops/${encodeURIComponent(created.name)}`);
      } catch (err) {
        console.error("Create shop failed", err);
        setStatus("error");
        setError(
          err instanceof Error
            ? err.message
            : "Unable to create shop. Please try again.",
        );
      }
    },
    [form.name, form.address, refreshShop, refreshUser, navigate],
  );

  const summaryItems = useMemo(
    () => [
      "Give your shop a friendly name customers will recognize.",
      "Add your city to show up in local search results.",
      "Use a booking link slug that matches your brand.",
      "Toggle walk-ins if you want to allow on-the-spot bookings.",
    ],
    [],
  );

  return (
    <div className="create-shop">
      <header className="create-shop__header">
        <div className="create-shop__titles">
          <h1 className="create-shop__title">Create a new shop</h1>
          <p className="create-shop__subtitle">
            Set up your shop profile so customers know where to book and how to
            reach you.
          </p>
        </div>
      </header>

      <div className="create-shop__grid">
        <section className="card create-shop__card">
          <form className="create-shop__form stack-lg" onSubmit={handleSubmit}>
            <div className="create-shop__formRow">
              <div className="field">
                <label htmlFor="name">Shop name</label>
                <input
                  id="name"
                  name="name"
                  className="input"
                  placeholder="Ex: Downtown Cuts"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="address">Location</label>
                <input
                  id="address"
                  name="address"
                  className="input"
                  placeholder="City, country"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="create-shop__formRow">
              <div className="field">
                <label htmlFor="timezone">Timezone</label>
                <select
                  id="timezone"
                  name="timezone"
                  className="select input"
                  value={form.timezone}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select a timezone
                  </option>
                  <option value="UTC">UTC</option>
                  <option value="Europe/Berlin">Europe/Berlin</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Asia/Singapore">Asia/Singapore</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="bookingUrl">Booking link</label>
                <div className="input input--with-prefix">
                  <span className="input__prefix">bookings.app/</span>
                  <input
                    id="bookingUrl"
                    name="bookingUrl"
                    className="input input--bare"
                    placeholder="downtown-cuts"
                    value={form.bookingUrl}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="create-shop__formRow">
              <div className="field">
                <label htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  name="phone"
                  className="input"
                  placeholder="+49 123 4567"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  className="input"
                  placeholder="https://yourshop.com"
                  value={form.website}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                className="input create-shop__textarea"
                placeholder="Services offered, style, parking info, etc."
                value={form.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <label className="create-shop__checkbox">
              <input
                type="checkbox"
                name="allowWalkIns"
                checked={form.allowWalkIns}
                onChange={handleChange}
              />
              <div className="create-shop__checkboxCopy">
                <span className="create-shop__checkboxTitle">Allow walk-ins</span>
                <span className="create-shop__checkboxSub">
                  Keep this enabled if you accept on-site bookings without an online
                  reservation.
                </span>
              </div>
            </label>

            <div className="create-shop__actions">
              <button
                className="btn btn--ghost"
                type="button"
                onClick={() => setForm(EMPTY_FORM)}
                disabled={status === "pending"}
              >
                Reset
              </button>
              <button className="btn btn--primary" type="submit" disabled={status === "pending"}>
                {status === "pending" ? "Creating…" : "Save shop"}
              </button>
            </div>

            {status === "success" && (
              <p className="create-shop__success">Shop created! Redirecting you now…</p>
            )}
            {status === "error" && error && <p className="create-shop__error">{error}</p>}
          </form>
        </section>

        <aside className="card create-shop__info">
          <div className="create-shop__badge">Preview</div>
          <h3 className="create-shop__infoTitle">How your shop shows up</h3>
          <p className="create-shop__infoText">
            Customers will see these details on your booking link and in their
            confirmation emails. Keep it short, friendly, and accurate.
          </p>

          <ul className="create-shop__list">
            {summaryItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="create-shop__preview card card--ghost">
            <div className="create-shop__previewHeader">
              <div>
                <div className="create-shop__previewName">{form.name || "Your shop name"}</div>
                <div className="create-shop__previewMeta">
                  {form.address || "City"} • {form.timezone || "Timezone"}
                </div>
              </div>
              <span className="create-shop__pill">Booking</span>
            </div>

            <p className="create-shop__previewText">
              {form.description ||
                "Describe what you do, how long services take, and any special instructions."}
            </p>

            <div className="create-shop__previewFooter">
              <span className="create-shop__pill create-shop__pill--muted">
                {form.allowWalkIns ? "Walk-ins allowed" : "Online bookings only"}
              </span>
              {form.bookingUrl && (
                <span className="create-shop__previewLink">bookings.app/{form.bookingUrl}</span>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CreateShop;