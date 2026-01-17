import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import "../../protected/Bookings/AddBooking/AddBooking.css";
import "./BookingPage.css";
import {
  createPublicBooking,
  getPublicShopByBookingEndpoint,
  getPublicShopHours,
  getPublicSlots,
  listPublicProviders,
  listPublicServices,
} from "../../../api/public";
import { useI18n } from "../../../i18n";
import { getFriendlyError } from "../../../utils/errors";
import type { DayOfWeek } from "../../../types/common";
import type { ShopSummary } from "../../../types/shop";
import type {
  PublicProvider,
  PublicShopHour,
  PublicSlotsResponse,
  SlotSearchParams,
} from "../../../types/public";
import type { PublicService } from "../../../types/public";

type Step = 1 | 2 | 3;

type SlotSelection = {
  startTime: string;
  providerId?: number;
};

type SlotGroup = {
  providerId?: number;
  providerName: string;
  slots: PublicSlotsResponse["slots"];
};

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatDate(value: string) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const BookingPage: React.FC = () => {
  const { bookingEndpoint } = useParams();
  const { t } = useI18n();

  const [shop, setShop] = useState<ShopSummary | null>(null);
  const [shopStatus, setShopStatus] = useState<"idle" | "loading" | "error">("idle");
  const [shopError, setShopError] = useState<string>("");

  const [step, setStep] = useState<Step>(1);

  const [services, setServices] = useState<PublicService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string>("");

  const [providers, setProviders] = useState<PublicProvider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState<string>("");

  const [serviceId, setServiceId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [date, setDate] = useState("");

  const [slots, setSlots] = useState<PublicSlotsResponse["slots"]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string>("");

  const [workingHours, setWorkingHours] = useState<PublicShopHour[] | null>(null);
  const [workingHoursStatus, setWorkingHoursStatus] = useState<"idle" | "loading" | "error">(
    "idle",
  );

  const [selectedSlot, setSelectedSlot] = useState<SlotSelection | null>(null);

  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState<string>("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [note, setNote] = useState("");

  const decodedEndpoint = bookingEndpoint ? decodeURIComponent(bookingEndpoint) : "";

  useEffect(() => {
    if (!decodedEndpoint) return;
    const loadShop = async () => {
      setShopStatus("loading");
      setShopError("");
      try {
        const data = await getPublicShopByBookingEndpoint(decodedEndpoint);
        setShop(data);
        setShopStatus("idle");
      } catch (err) {
        setShop(null);
        setShopStatus("error");
        setShopError(
          err instanceof Error ? err.message : t("Unable to load this shop right now."),
        );
      }
    };
    loadShop();
  }, [decodedEndpoint, t]);

  useEffect(() => {
    const loadServices = async () => {
      if (!shop?.id) return;
      setServicesLoading(true);
      setServicesError("");
      try {
        const data = await listPublicServices(shop.id);
        setServices(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : t("Unable to load services.");
        setServicesError(message);
      } finally {
        setServicesLoading(false);
      }
    };
    loadServices();
  }, [shop?.id, t]);

  useEffect(() => {
    const loadProviders = async () => {
      if (!shop?.id) return;
      setProvidersLoading(true);
      setProvidersError("");
      try {
        const data = await listPublicProviders(shop.id);
        setProviders(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : t("Unable to load providers.");
        setProvidersError(message);
        setProviders([]);
      } finally {
        setProvidersLoading(false);
      }
    };
    loadProviders();
  }, [shop?.id, t]);

  const providerLookup = useMemo(() => {
    const map = new Map<number, PublicProvider>();
    providers.forEach((member) => map.set(member.id, member));
    return map;
  }, [providers]);

  const selectedService = useMemo(
    () => services.find((svc) => String(svc.id) === serviceId) ?? null,
    [services, serviceId],
  );

  const selectedProvider = useMemo(() => {
    if (!providerId) return null;
    return providers.find((provider) => String(provider.id) === providerId) ?? null;
  }, [providerId, providers]);

  const canSearch = Boolean(serviceId) && Boolean(date) && Boolean(shop?.id);

  const slotGroups = useMemo<SlotGroup[]>(() => {
    if (slots.length === 0) return [];

    const sortedSlots = slots.slice().sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (providerId) {
      const providerName = selectedProvider
        ? `${selectedProvider.user.firstName} ${selectedProvider.user.lastName}`.trim()
        : t("Selected provider");

      return [{ providerId: Number(providerId), providerName, slots: sortedSlots }];
    }

    const grouped = new Map<number, PublicSlotsResponse["slots"]>();
    sortedSlots.forEach((slot) => {
      slot.providerIds.forEach((id) => {
        if (!grouped.has(id)) grouped.set(id, []);
        grouped.get(id)?.push(slot);
      });
    });

    return Array.from(grouped.entries())
      .map(([id, groupedSlots]) => {
        const member = providerLookup.get(id);
        const name = member
          ? `${member.user.firstName} ${member.user.lastName}`.trim()
          : `${t("Provider")} #${id}`;
        return { providerId: id, providerName: name, slots: groupedSlots };
      })
      .sort((a, b) => a.providerName.localeCompare(b.providerName));
  }, [slots, providerId, selectedProvider, providerLookup, t]);

  const resetSlots = () => {
    setSlots([]);
    setSlotsError("");
    setSelectedSlot(null);
  };

  const loadWorkingHours = async (activeShopId: number) => {
    setWorkingHoursStatus("loading");
    try {
      const data = await getPublicShopHours(activeShopId);
      setWorkingHours(data);
      setWorkingHoursStatus("idle");
    } catch {
      setWorkingHours(null);
      setWorkingHoursStatus("error");
    }
  };

  const handleFindTimes = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSearch || !shop?.id) return;

    resetSlots();
    setSlotsLoading(true);

    if (!providerId) {
      setWorkingHours(null);
      setWorkingHoursStatus("idle");
    }

    try {
      const params: SlotSearchParams = {
        shopId: shop.id,
        serviceId: Number(serviceId),
        date,
      };

      if (providerId) {
        params.providerId = Number(providerId);
      }

      const data = await getPublicSlots(params);
      setSlots(data.slots ?? []);
      setSlotsError("");

      if (!providerId) {
        await loadWorkingHours(shop.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t("Unable to load available slots.");
      setSlotsError(message);
    } finally {
      setSlotsLoading(false);
      setStep(2);
    }
  };

  const handleConfirm = async () => {
    if (!selectedSlot || !serviceId || !shop?.id) return;
    if (!customerEmail.trim()) {
      setSubmitError(t("Please add your email to receive the booking confirmation."));
      setSubmitStatus("error");
      return;
    }
    setSubmitStatus("saving");
    setSubmitError("");

    try {
      await createPublicBooking(shop.id, {
        serviceId: Number(serviceId),
        startTime: selectedSlot.startTime,
        providerId: selectedSlot.providerId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        note: note.trim() || undefined,
      });
      setSubmitStatus("success");
    } catch (err) {
      setSubmitError(
        getFriendlyError(err, t, "We couldn't create the booking. Please try again."),
      );
      setSubmitStatus("error");
    }
  };

  const selectedProviderName = selectedSlot?.providerId
    ? (() => {
        const member = providerLookup.get(selectedSlot.providerId ?? 0);
        if (!member)
          return selectedSlot.providerId ? `${t("Provider")} #${selectedSlot.providerId}` : "";
        return `${member.user.firstName} ${member.user.lastName}`.trim();
      })()
    : selectedProvider
      ? `${selectedProvider.user.firstName} ${selectedProvider.user.lastName}`.trim()
      : t("Any provider");

  const dayLabels = useMemo<Record<DayOfWeek, string>>(
    () => ({
      MONDAY: t("Mon"),
      TUESDAY: t("Tue"),
      WEDNESDAY: t("Wed"),
      THURSDAY: t("Thu"),
      FRIDAY: t("Fri"),
      SATURDAY: t("Sat"),
      SUNDAY: t("Sun"),
    }),
    [t],
  );

  const conflictHint = useMemo(() => {
    if (!submitError) return "";
    const lower = submitError.toLowerCase();
    if (lower.includes("conflict") || lower.includes("overlap") || lower.includes("booked")) {
      return t("This time conflicts with another booking. Please choose a different slot.");
    }
    return "";
  }, [submitError, t]);

  if (shopStatus === "loading") {
    return <p className="public-booking__state">{t("Loading shop…")}</p>;
  }

  if (shopStatus === "error") {
    return <p className="public-booking__state public-booking__state--error">{shopError}</p>;
  }

  if (!shop) {
    return <p className="public-booking__state">{t("Shop not found.")}</p>;
  }

  return (
    <div className="public-booking">
      <div className="public-booking__shell">
        <div className="public-booking__card">
          <header className="public-booking__header">
            <div className="public-booking__headerText">
              <h1 className="public-booking__title">{shop.name}</h1>
              <p className="public-booking__subtitle">
                {shop.address ? shop.address : t("Book your appointment below.")}
              </p>
              {shop.websiteUrl && (
                <a
                  className="public-booking__link"
                  href={shop.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("Visit website")}
                </a>
              )}
            </div>
          </header>

          <div className="public-booking__body">
            <nav className="public-booking__steps" aria-label={t("Booking steps")}>
              <button
                className={`public-booking__step ${step === 1 ? "is-active" : ""}`}
                type="button"
                aria-current={step === 1 ? "step" : undefined}
                onClick={() => setStep(1)}
              >
                <span className="public-booking__stepIndex">1</span>
                <span className="public-booking__stepLabel">{t("Preferences")}</span>
              </button>
              <button
                className={`public-booking__step ${step === 2 ? "is-active" : ""}`}
                type="button"
                aria-current={step === 2 ? "step" : undefined}
                onClick={() => setStep(2)}
                disabled={!canSearch}
                aria-disabled={!canSearch}
              >
                <span className="public-booking__stepIndex">2</span>
                <span className="public-booking__stepLabel">{t("Pick a time")}</span>
              </button>
              <button
                className={`public-booking__step ${step === 3 ? "is-active" : ""}`}
                type="button"
                aria-current={step === 3 ? "step" : undefined}
                onClick={() => setStep(3)}
                disabled={!selectedSlot}
                aria-disabled={!selectedSlot}
              >
                <span className="public-booking__stepIndex">3</span>
                <span className="public-booking__stepLabel">{t("Confirm")}</span>
              </button>
            </nav>

            {step === 1 && (
              <form className="public-booking__section" onSubmit={handleFindTimes}>
                <div className="public-booking__sectionHead">
                  <h2>{t("Choose your preferences")}</h2>
                  <p>{t("Select a service, provider, and date to see availability.")}</p>
                </div>

                <div className="public-booking__formGrid">
                  <label className="public-booking__field">
                    <span>{t("Service")}</span>
                    <select
                      className="select"
                      value={serviceId}
                      onChange={(event) => {
                        setServiceId(event.target.value);
                        resetSlots();
                      }}
                      disabled={servicesLoading}
                      required
                    >
                      <option value="">
                        {servicesLoading ? t("Loading services...") : t("Select service")}
                      </option>
                      {services.map((svc) => (
                        <option key={svc.id} value={svc.id}>
                          {svc.name}
                        </option>
                      ))}
                    </select>
                    {servicesError ? (
                      <small className="public-booking__hint">{servicesError}</small>
                    ) : null}
                  </label>

                  <label className="public-booking__field">
                    <span>{t("Provider (optional)")}</span>
                    <select
                      className="select"
                      value={providerId}
                      onChange={(event) => {
                        setProviderId(event.target.value);
                        resetSlots();
                      }}
                      disabled={providersLoading}
                    >
                      <option value="">
                        {providersLoading ? t("Loading providers...") : t("Any provider")}
                      </option>
                      {providers.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.user.firstName} {provider.user.lastName}
                        </option>
                      ))}
                    </select>
                    {providersError ? (
                      <small className="public-booking__hint">{providersError}</small>
                    ) : null}
                  </label>

                  <label className="public-booking__field">
                    <span>{t("Date")}</span>
                    <input
                      className="input"
                      type="date"
                      value={date}
                      onChange={(event) => {
                        setDate(event.target.value);
                        resetSlots();
                      }}
                      required
                    />
                  </label>
                </div>

                <div className="public-booking__actions">
                  <button className="btn btn--primary" type="submit" disabled={!canSearch}>
                    {t("Find available times")}
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <section className="public-booking__section">
                <div className="public-booking__sectionHead public-booking__sectionHead--split">
                  <div>
                    <h2>{t("Pick a time")}</h2>
                    <p>
                      {selectedService?.name ?? t("Selected service")} • {formatDate(date)}
                    </p>
                  </div>
                  <button className="btn btn--ghost" type="button" onClick={() => setStep(1)}>
                    {t("Edit preferences")}
                  </button>
                </div>

                {slotsLoading && <p className="public-booking__state">{t("Loading available times…")}</p>}
                {!slotsLoading && slotsError && (
                  <p className="public-booking__state public-booking__state--error">{slotsError}</p>
                )}
                {!slotsLoading && !slotsError && slots.length === 0 && (
                  <p className="public-booking__state">
                    {t("No available times for the selected day.")}
                  </p>
                )}

                {!slotsLoading && !slotsError && slotGroups.length > 0 && (
                  <div className="public-booking__slots">
                    {slotGroups.map((group) => (
                      <div className="public-booking__slotGroup" key={group.providerName}>
                        <div className="public-booking__slotHeader">
                          <span>{group.providerName}</span>
                        </div>
                        <div className="public-booking__slotGrid">
                          {group.slots.map((slot) => {
                            const isSelected =
                              selectedSlot?.startTime === slot.startTime &&
                              (providerId
                                ? Number(providerId) === selectedSlot?.providerId
                                : group.providerId === selectedSlot?.providerId);
                            return (
                              <button
                                key={`${group.providerName}-${slot.startTime}`}
                                type="button"
                                className={`public-booking__slot ${isSelected ? "is-active" : ""}`}
                                onClick={() =>
                                  setSelectedSlot({
                                    startTime: slot.startTime,
                                    providerId: providerId ? Number(providerId) : group.providerId,
                                  })
                                }
                              >
                                {formatTime(slot.startTime)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!providerId && (
                  <div className="public-booking__hours">
                    <h3>{t("Working hours")}</h3>
                    {workingHoursStatus === "loading" && <p>{t("Loading working hours…")}</p>}
                    {workingHoursStatus === "error" && <p>{t("Working hours unavailable.")}</p>}
                    {workingHoursStatus === "idle" && (!workingHours || workingHours.length === 0) && (
                      <p>{t("Working hours unavailable.")}</p>
                    )}
                    {workingHoursStatus === "idle" && workingHours && workingHours.length > 0 && (
                      <ul className="public-booking__hoursList">
                        {workingHours.map((hour) => (
                          <li key={hour.dayOfWeek}>
                            <strong>{dayLabels[hour.dayOfWeek]}</strong>{" "}
                            {hour.isClosed ? t("Closed") : `${hour.openTime} – ${hour.closeTime}`}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <div className="public-booking__actions">
                  <button
                    className="btn btn--primary"
                    type="button"
                    disabled={!selectedSlot}
                    onClick={() => setStep(3)}
                  >
                    {t("Continue to confirm")}
                  </button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="public-booking__section">
                <div className="public-booking__sectionHead public-booking__sectionHead--split">
                  <div>
                    <h2>{t("Confirm booking")}</h2>
                    <p>{t("Review details before creating the booking.")}</p>
                  </div>
                  <button className="btn btn--ghost" type="button" onClick={() => setStep(2)}>
                    {t("Back to times")}
                  </button>
                </div>

                <div className="public-booking__receipt">
                  <div>
                    <span className="public-booking__receiptLabel">{t("Service")}</span>
                    <span>{selectedService?.name ?? "—"}</span>
                  </div>
                  <div>
                    <span className="public-booking__receiptLabel">{t("Provider")}</span>
                    <span>{selectedProviderName}</span>
                  </div>
                  <div>
                    <span className="public-booking__receiptLabel">{t("Date")}</span>
                    <span>{formatDate(date)}</span>
                  </div>
                  <div>
                    <span className="public-booking__receiptLabel">{t("Time")}</span>
                    <span>{selectedSlot ? formatTime(selectedSlot.startTime) : "—"}</span>
                  </div>
                </div>

                <div className="public-booking__formGrid">
                  <label className="public-booking__field">
                    <span>{t("Your name")}</span>
                    <input
                      className="input"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      maxLength={100}
                    />
                  </label>

                  <label className="public-booking__field">
                    <span>{t("Phone number")}</span>
                    <input
                      className="input"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                      maxLength={30}
                      placeholder={t("+44 …")}
                    />
                  </label>

                  <label className="public-booking__field">
                    <span>{t("Email")}</span>
                    <input
                      className="input"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder={t("you@email.com")}
                      required
                    />
                  </label>

                  <label className="public-booking__field public-booking__field--full">
                    <span>{t("Note (optional)")}</span>
                    <textarea
                      className="textarea"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      maxLength={280}
                    />
                  </label>
                </div>

                {submitStatus === "error" && (
                  <p className="public-booking__state public-booking__state--error">{submitError}</p>
                )}
                {submitStatus === "error" && conflictHint && (
                  <p className="public-booking__state public-booking__state--warning">{conflictHint}</p>
                )}
                {submitStatus === "success" && (
                  <p className="public-booking__state public-booking__state--success">
                    {t("Booking submitted! We’ll see you soon.")}
                  </p>
                )}

                <div className="public-booking__actions">
                  <button
                    className="btn btn--primary"
                    type="button"
                    onClick={handleConfirm}
                    disabled={submitStatus === "saving"}
                  >
                    {submitStatus === "saving" ? t("Creating booking…") : t("Confirm booking")}
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
