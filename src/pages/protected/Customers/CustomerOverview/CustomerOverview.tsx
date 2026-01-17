import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getCustomer, listCustomerBookings, updateCustomer } from "../../../../api/customers";
import type { BookingWithRelations } from "../../../../types/bookings";
import type { Customer } from "../../../../types/customers";
import { useI18n } from "../../../../i18n";
import "./CustomerOverview.css";

const CustomerOverview: React.FC = () => {
  const { shopName, customerId } = useParams();
  const parsedId = Number(customerId);
  const { t } = useI18n();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    note: "",
    banned: false,
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveError, setSaveError] = useState<string>("");

  useEffect(() => {
    if (!parsedId || Number.isNaN(parsedId)) {
      setError(t("Invalid customer."));
      setLoading(false);
      return;
    }

    let alive = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [customerData, bookingsData] = await Promise.all([
          getCustomer(parsedId),
          listCustomerBookings(parsedId, { limit: 50 }),
        ]);
        if (!alive) return;
        setCustomer(customerData);
        setForm({
          name: customerData.name ?? "",
          phone: customerData.phone ?? "",
          email: customerData.email ?? "",
          note: customerData.note ?? "",
          banned: customerData.banned ?? false,
        });
        setBookings(bookingsData.items ?? []);
      } catch (err) {
        if (!alive) return;
        const message = err instanceof Error ? err.message : t("Unable to load customer.");
        setError(message);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [parsedId, t]);

  const sortedBookings = useMemo(() => {
    return bookings
      .slice()
      .sort((a, b) => (b.startTime ?? "").localeCompare(a.startTime ?? ""));
  }, [bookings]);

  const formatDate = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (
    event,
  ) => {
    const { name, value, type, checked } = event.target as HTMLInputElement;
    const nextValue = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
    if (saveStatus === "success") setSaveStatus("idle");
    if (saveError) setSaveError("");
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!customer) return;

    setSaveStatus("saving");
    setSaveError("");

    try {
      const updated = await updateCustomer(customer.id, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        note: form.note.trim() || undefined,
        banned: form.banned,
      });
      setCustomer(updated);
      setSaveStatus("success");
    } catch (err) {
      const message = err instanceof Error ? err.message : t("Unable to update customer.");
      setSaveError(message);
      setSaveStatus("error");
    }
  };

  return (
    <div className="customerPage">
      <div className="customerPage__inner">
        <header className="customerPage__header">
          <div>
            <p className="customerPage__eyebrow">{t("Customers")}</p>
            <h1 className="customerPage__title">{t("Customer profile")}</h1>
            <p className="customerPage__subtitle">
              {t("Review contact details and booking history for this customer.")}
            </p>
          </div>
          {shopName ? (
            <Link className="btn btn--ghost" to={`/shops/${encodeURIComponent(shopName)}/calendar`}>
              {t("Back to calendar")}
            </Link>
          ) : null}
        </header>

        {loading && <div className="customerPage__state">{t("Loading customer…")}</div>}
        {!loading && error && <div className="customerPage__state customerPage__state--error">{error}</div>}

        {!loading && !error && customer && (
          <>
            <section className="card customerPage__card">
              <div className="customerPage__profile">
                <div>
                  <h2 className="customerPage__name">{customer.name}</h2>
                  <p className="customerPage__meta">{customer.phone}</p>
                  {customer.email ? (
                    <p className="customerPage__meta">{customer.email}</p>
                  ) : null}
                </div>
              <div className="customerPage__pill">
                {customer.banned ? t("Banned") : t("Active")}
              </div>
            </div>
              {customer.note ? (
                <div className="customerPage__note">{customer.note}</div>
              ) : null}
            </section>

            <section className="card customerPage__card">
              <div className="customerPage__cardHead">
                <div>
                <h2>{t("Edit customer")}</h2>
                <p className="customerPage__hint">{t("Update contact details and notes.")}</p>
              </div>
            </div>

              <form className="customerPage__form" onSubmit={handleSubmit}>
                <div className="customerPage__formGrid">
                  <div className="field">
                    <label htmlFor="customerName">{t("Name")}</label>
                    <input
                      id="customerName"
                      name="name"
                      className="input"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="customerPhone">{t("Phone")}</label>
                    <input
                      id="customerPhone"
                      name="phone"
                      className="input"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="customerEmail">{t("Email")}</label>
                    <input
                      id="customerEmail"
                      name="email"
                      className="input"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder={t("you@example.com")}
                    />
                  </div>
                  <div className="field customerPage__fieldFull">
                    <label htmlFor="customerNote">{t("Note")}</label>
                    <textarea
                      id="customerNote"
                      name="note"
                      className="textarea"
                      value={form.note}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </div>

                <label className="customerPage__toggle">
                  <input
                    type="checkbox"
                    name="banned"
                    checked={form.banned}
                    onChange={handleChange}
                  />
                  <span>{form.banned ? t("Banned") : t("Active")}</span>
                </label>

                {saveError && (
                  <div className="customerPage__state customerPage__state--error">{saveError}</div>
                )}
                {saveStatus === "success" && (
                  <div className="customerPage__state">{t("Customer updated.")}</div>
                )}

                <div className="customerPage__actions">
                  <button
                    className="btn btn--ghost"
                    type="button"
                    onClick={() =>
                      setForm({
                        name: customer.name ?? "",
                        phone: customer.phone ?? "",
                        email: customer.email ?? "",
                        note: customer.note ?? "",
                        banned: customer.banned ?? false,
                      })
                    }
                    disabled={saveStatus === "saving"}
                  >
                    {t("Reset")}
                  </button>
                  <button
                    className="btn btn--primary"
                    type="submit"
                    disabled={saveStatus === "saving"}
                  >
                    {saveStatus === "saving" ? t("Saving…") : t("Save changes")}
                  </button>
                </div>
              </form>
            </section>

            <section className="card customerPage__card">
              <div className="customerPage__cardHead">
                <div>
                  <h2>{t("Booking history")}</h2>
                  <p className="customerPage__hint">{t("Older bookings for this customer.")}</p>
                </div>
                <div className="customerPage__count">{sortedBookings.length}</div>
              </div>

              {sortedBookings.length === 0 ? (
                <div className="customerPage__state">{t("No bookings found for this customer.")}</div>
              ) : (
                <div className="customerPage__tableWrap">
                  <table className="customerPage__table">
                    <thead>
                      <tr>
                        <th>{t("Date")}</th>
                        <th>{t("Time")}</th>
                        <th>{t("Service")}</th>
                        <th>{t("Status")}</th>
                        <th>{t("Provider")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedBookings.map((booking) => {
                        const providerName =
                          booking.provider?.user?.firstName && booking.provider?.user?.lastName
                            ? `${booking.provider.user.firstName} ${booking.provider.user.lastName}`.trim()
                            : "—";
                        return (
                          <tr key={booking.id}>
                            <td>{formatDate(booking.startTime)}</td>
                            <td>{formatTime(booking.startTime)}</td>
                            <td>{booking.service?.name ?? "—"}</td>
                            <td>
                              <span
                                className={`customerPage__status customerPage__status--${String(
                                  booking.status ?? "default",
                                ).toLowerCase()}`}
                              >
                                {booking.status ?? "—"}
                              </span>
                            </td>
                            <td>{providerName}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerOverview;
