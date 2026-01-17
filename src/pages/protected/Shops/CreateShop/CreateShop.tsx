import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { setActiveShopId } from "../../../../api/http";
import { createShop } from "../../../../api/shop";
import { useAuth } from "../../../../providers/AuthProvider";
import { useShop } from "../../../../providers/ShopProvider";
import type { CreateShopPayload } from "../../../../types/shop";
import { useI18n } from "../../../../i18n";

import "./CreateShop.css";

type FormState = {
  name: string;
  address: string;
  websiteUrl: string;
  showDirectionsLink: boolean;
  includeCalendarLink: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  address: "",
  websiteUrl: "",
  showDirectionsLink: true,
  includeCalendarLink: false,
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
  const { t } = useI18n();

  const normalizeUrl = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }, []);

  const buildBookingEndpoint = useCallback((name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const base = slug || "shop";
    return `${base}.bookly.com`;
  }, []);

  const handleChange = useCallback<
    React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  >(
    (event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const { name, value } = target;

      const nextValue =
        target instanceof HTMLInputElement && target.type === "checkbox" ? target.checked : value;

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
        setError(t("Please add a shop name to continue."));
        return;
      }
      setStatus("pending");
      setError(null);

      try {
        const payload: CreateShopPayload = {
          name: form.name.trim(),
          address: form.address.trim() || null,
          websiteUrl: form.websiteUrl.trim() ? normalizeUrl(form.websiteUrl) : null,
          showDirectionsLink: form.showDirectionsLink,
          includeCalendarLink: form.includeCalendarLink,
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
          err instanceof Error ? err.message : t("Unable to create shop. Please try again."),
        );
      }
    },
    [
      form.name,
      form.address,
      form.websiteUrl,
      form.showDirectionsLink,
      form.includeCalendarLink,
      refreshShop,
      refreshUser,
      navigate,
      t,
      normalizeUrl,
    ],
  );

  const summaryItems = useMemo(
    () => [
      t("Give your shop a friendly name customers will recognize."),
      t("Your booking link is generated from the shop name."),
      t("Include a website URL so guests can learn more about your shop."),
      t("Toggle calendar and directions links for booking confirmations."),
    ],
    [t],
  );

  return (
    <div className="create-shop">
      <header className="create-shop__header">
        <div className="create-shop__titles">
          <h1 className="create-shop__title">{t("Create a new shop")}</h1>
          <p className="create-shop__subtitle">
            {t("Set up your shop profile so customers know where to book and how to reach you.")}
          </p>
        </div>
      </header>

      <div className="create-shop__grid">
        <section className="card create-shop__card">
          <form className="create-shop__form stack-lg" onSubmit={handleSubmit}>
            <div className="create-shop__formRow">
              <div className="field">
                <label htmlFor="name">{t("Shop name")}</label>
                <input
                  id="name"
                  name="name"
                  className="input"
                  placeholder={t("Ex: Downtown Cuts")}
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="address">{t("Location")}</label>
                <input
                  id="address"
                  name="address"
                  className="input"
                  placeholder={t("City, country")}
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="create-shop__formRow">
              <div className="field">
                <label htmlFor="websiteUrl">{t("Website")}</label>
                <input
                  id="websiteUrl"
                  name="websiteUrl"
                  className="input"
                  placeholder={t("https://yourshop.com")}
                  value={form.websiteUrl}
                  onChange={handleChange}
                  type="url"
                />
              </div>

              <div className="field">
                <label>{t("Booking URL")}</label>
                <div className="input create-shop__readonly">
                  {form.name.trim()
                    ? buildBookingEndpoint(form.name)
                    : t("Generated after you name the shop")}
                </div>
              </div>
            </div>

            <label className="create-shop__checkbox">
              <input
                type="checkbox"
                name="showDirectionsLink"
                checked={form.showDirectionsLink}
                onChange={handleChange}
              />
              <div className="create-shop__checkboxCopy">
                <span className="create-shop__checkboxTitle">
                  {t("Include directions link")}
                </span>
                <span className="create-shop__checkboxSub">
                  {t("Add a Google Maps directions link in booking confirmations.")}
                </span>
              </div>
            </label>

            <label className="create-shop__checkbox">
              <input
                type="checkbox"
                name="includeCalendarLink"
                checked={form.includeCalendarLink}
                onChange={handleChange}
              />
              <div className="create-shop__checkboxCopy">
                <span className="create-shop__checkboxTitle">
                  {t("Include calendar link")}
                </span>
                <span className="create-shop__checkboxSub">
                  {t("Provide a Google Calendar link for customers to save bookings.")}
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
                {t("Reset")}
              </button>
              <button className="btn btn--primary" type="submit" disabled={status === "pending"}>
                {status === "pending" ? t("Creating…") : t("Save shop")}
              </button>
            </div>

            {status === "success" && (
              <p className="create-shop__success">
                {t("Shop created! Redirecting you now…")}
              </p>
            )}
            {status === "error" && error && <p className="create-shop__error">{error}</p>}
          </form>
        </section>

        <aside className="card create-shop__info">
          <div className="create-shop__badge">{t("Preview")}</div>
          <h3 className="create-shop__infoTitle">{t("How your shop shows up")}</h3>
          <p className="create-shop__infoText">
            {t(
              "Customers will see these details on your booking link and in their confirmation emails. Keep it short, friendly, and accurate.",
            )}
          </p>

          <ul className="create-shop__list">
            {summaryItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="create-shop__preview card card--ghost">
            <div className="create-shop__previewHeader">
              <div>
                <div className="create-shop__previewName">{form.name || t("Your shop name")}</div>
                <div className="create-shop__previewMeta">
                  {form.address || t("City")}
                </div>
              </div>
              <span className="create-shop__pill">{t("Booking")}</span>
            </div>

            <p className="create-shop__previewText">
              {form.name.trim()
                ? buildBookingEndpoint(form.name)
                : t("Your booking URL appears once you name your shop.")}
            </p>

            <div className="create-shop__previewFooter">
              <span className="create-shop__pill create-shop__pill--muted">
                {form.includeCalendarLink ? t("Calendar links on") : t("Calendar links off")}
              </span>
              {form.name.trim() && (
                <span className="create-shop__previewLink">
                  {buildBookingEndpoint(form.name)}
                </span>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CreateShop;
