import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import "./AddBooking.css";
import { createBooking } from "../../../../api/bookings";
import { getActiveShopId } from "../../../../api/http";
import { getPublicShopHours, getPublicSlots } from "../../../../api/public";
import { listServices } from "../../../../api/services";
import { getTeamOverview } from "../../../../api/team";
import { useI18n } from "../../../../i18n";
import { getFriendlyError } from "../../../../utils/errors";
import type { DayOfWeek } from "../../../../types/common";
import type {
  PublicShopHour,
  PublicSlotsResponse,
  SlotSearchParams,
} from "../../../../types/public";
import type { Service } from "../../../../types/services";
import type { TeamMemberSummary, TeamOverview } from "../../../../types/team";

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

const AddBooking: React.FC = () => {
  const navigate = useNavigate();
  const { shopName } = useParams();
  const shopId = getActiveShopId();
  const { t } = useI18n();

  const [step, setStep] = useState<Step>(1);

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string>("");

  const [overview, setOverview] = useState<TeamOverview | null>(null);
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
  const [note, setNote] = useState("");

  const providers = useMemo(() => {
    const members = overview?.members ?? [];
    return members
      .slice()
      .filter((member) => member.active && member.bookable)
      .sort((a, b) => a.firstName.localeCompare(b.firstName));
  }, [overview]);

  const providerLookup = useMemo(() => {
    const map = new Map<number, TeamMemberSummary>();
    providers.forEach((member) => map.set(member.shopUserId, member));
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

  const canSearch = Boolean(serviceId) && Boolean(date);

  const slotGroups = useMemo<SlotGroup[]>(() => {
    if (slots.length === 0) return [];

    const sortedSlots = slots.slice().sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (providerId) {
      const providerName = selectedProvider
        ? `${selectedProvider.firstName} ${selectedProvider.lastName}`.trim()
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
          ? `${member.firstName} ${member.lastName}`.trim()
          : `${t("Provider")} #${id}`;
        return { providerId: id, providerName: name, slots: groupedSlots };
      })
      .sort((a, b) => a.providerName.localeCompare(b.providerName));
  }, [slots, providerId, selectedProvider, providerLookup, t]);

  useEffect(() => {
    const loadServices = async () => {
      setServicesLoading(true);
      setServicesError("");

      try {
        const data = await listServices();
        setServices(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : t("Unable to load services.");
        setServicesError(message);
      } finally {
        setServicesLoading(false);
      }
    };

    loadServices();
  }, [t]);

  useEffect(() => {
    const loadProviders = async () => {
      if (!shopId) {
        setProvidersError(t("Select a shop to load providers."));
        setOverview(null);
        return;
      }

      setProvidersLoading(true);
      setProvidersError("");

      try {
        const data = await getTeamOverview();
        setOverview(data);
        
      } catch (err) {
        const message = err instanceof Error ? err.message : t("Unable to load providers.");
        setProvidersError(message);
        setOverview(null);
      } finally {
        setProvidersLoading(false);
      }
    };

    loadProviders();
  }, [shopId, t]);

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
    if (!canSearch) return;

    resetSlots();
    setSlotsLoading(true);

    if (!providerId) {
      setWorkingHours(null);
      setWorkingHoursStatus("idle");
    }

    try {
      if (!shopId) throw new Error("No shop selected.");

      const params: SlotSearchParams = {
        shopId,
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
        await loadWorkingHours(shopId);
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
    if (!selectedSlot || !serviceId) return;
    setSubmitStatus("saving");
    setSubmitError("");

    try {
      await createBooking({
        serviceId: Number(serviceId),
        startTime: selectedSlot.startTime,
        providerId: selectedSlot.providerId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        note: note.trim() || undefined,
      });
      
      setSubmitStatus("success");
      setTimeout(() => {
        if (shopName) {
          navigate(`/shops/${encodeURIComponent(shopName)}/calendar`);
        } else {
          navigate("/overview");
        }
      }, 900);
    } catch (err) {
      setSubmitError(getFriendlyError(err, t, "We couldn't create the booking. Please try again."));
      setSubmitStatus("error");
    }
  };

  const selectedProviderName = selectedSlot?.providerId
    ? (() => {
        const member = providerLookup.get(selectedSlot.providerId ?? 0);
        if (!member)
          return selectedSlot.providerId ? `${t("Provider")} #${selectedSlot.providerId}` : "";
        return `${member.firstName} ${member.lastName}`.trim();
      })()
    : selectedProvider
      ? `${selectedProvider.firstName} ${selectedProvider.lastName}`.trim()
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

  return (
    <div className="add-booking">
      <header className="add-booking__header">
        <div>
          <h1 className="add-booking__title">{t("New booking")}</h1>
          <p className="add-booking__subtitle">{t("Create a manual booking for your calendar.")}</p>
        </div>
        {shopName ? (
          <Link className="btn btn--ghost" to={`/shops/${encodeURIComponent(shopName)}/calendar`}>
            {t("Back to calendar")}
          </Link>
        ) : null}
      </header>

      <div className="add-booking__wizard card">
        <div className="add-booking__steps">
          <button
            className={`add-booking__step ${step === 1 ? "add-booking__step--active" : ""}`}
            type="button"
            onClick={() => setStep(1)}
          >
            {t("1. Preferences")}
          </button>
          <button
            className={`add-booking__step ${step === 2 ? "add-booking__step--active" : ""}`}
            type="button"
            onClick={() => setStep(2)}
            disabled={!canSearch}
          >
            {t("2. Pick a time")}
          </button>
          <button
            className={`add-booking__step ${step === 3 ? "add-booking__step--active" : ""}`}
            type="button"
            onClick={() => setStep(3)}
            disabled={!selectedSlot}
          >
            {t("3. Confirm")}
          </button>
        </div>

        {step === 1 && (
          <form className="add-booking__panel" onSubmit={handleFindTimes}>
            <div className="add-booking__grid">
              <div className="add-booking__field">
                <label htmlFor="serviceId">{t("Service")}</label>
                <select
                  id="serviceId"
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
                  <small className="add-booking__hint">{servicesError}</small>
                ) : null}
              </div>

              <div className="add-booking__field">
                <label htmlFor="providerId">{t("Provider (optional)")}</label>
                <select
                  id="providerId"
                  className="select"
                  value={providerId}
                  onChange={(event) => {
                    setProviderId(event.target.value);
                    resetSlots();
                  }}
                  disabled={providersLoading || !shopId}
                >
                  <option value="">
                    {providersLoading ? t("Loading providers...") : t("Any provider")}
                  </option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.shopUserId}>
                      {provider.firstName} {provider.lastName}
                    </option>
                  ))}
                </select>
                {providersError ? (
                  <small className="add-booking__hint">{providersError}</small>
                ) : null}
              </div>

              <div className="add-booking__field">
                <label htmlFor="date">{t("Date")}</label>
                <input
                  id="date"
                  className="input"
                  type="date"
                  value={date}
                  onChange={(event) => {
                    setDate(event.target.value);
                    resetSlots();
                  }}
                  required
                />
              </div>
            </div>

            <div className="add-booking__actions">
              <button className="btn btn--primary" type="submit" disabled={!canSearch}>
                {t("Find available times")}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="add-booking__panel">
            <div className="add-booking__panelHead">
              <div>
                <h2>{t("Pick a time")}</h2>
                <p>
                  {selectedService?.name ?? t("Selected service")} • {formatDate(date)}
                </p>
              </div>
              <div className="add-booking__panelActions">
                <button className="btn btn--ghost" type="button" onClick={() => setStep(1)}>
                  {t("Edit preferences")}
                </button>
              </div>
            </div>

            {slotsLoading && <p className="add-booking__state">{t("Loading available times…")}</p>}
            {!slotsLoading && slotsError && (
              <p className="add-booking__state add-booking__state--error">{slotsError}</p>
            )}
            {!slotsLoading && !slotsError && slots.length === 0 && (
              <p className="add-booking__state">
                {t("No available times for the selected day.")}
              </p>
            )}

            {!slotsLoading && !slotsError && slotGroups.length > 0 && (
              <div className="add-booking__slots">
                {slotGroups.map((group) => (
                  <div className="add-booking__slotGroup" key={group.providerName}>
                    <div className="add-booking__slotGroupHeader">
                      <span>{group.providerName}</span>
                    </div>
                    <div className="add-booking__slotGrid">
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
                            className={`add-booking__slot ${isSelected ? "add-booking__slot--active" : ""}`}
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
              <div className="add-booking__hours card card--ghost">
                <h3>{t("Working hours")}</h3>
                {workingHoursStatus === "loading" && <p>{t("Loading working hours…")}</p>}
                {workingHoursStatus === "error" && <p>{t("Working hours unavailable.")}</p>}
                {workingHoursStatus === "idle" && (!workingHours || workingHours.length === 0) && (
                  <p>{t("Working hours unavailable.")}</p>
                )}
                {workingHoursStatus === "idle" && workingHours && workingHours.length > 0 && (
                  <ul>
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

            <div className="add-booking__actions">
              <button
                className="btn btn--primary"
                type="button"
                disabled={!selectedSlot}
                onClick={() => setStep(3)}
              >
                {t("Continue to confirm")}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="add-booking__panel">
            <div className="add-booking__panelHead">
              <div>
                <h2>{t("Confirm booking")}</h2>
                <p>{t("Review details before creating the booking.")}</p>
              </div>
              <div className="add-booking__panelActions">
                <button className="btn btn--ghost" type="button" onClick={() => setStep(2)}>
                  {t("Back to times")}
                </button>
              </div>
            </div>

            <div className="add-booking__summary card card--ghost">
              <div>
                <span className="add-booking__summaryLabel">{t("Service")}</span>
                <span>{selectedService?.name ?? "—"}</span>
              </div>
              <div>
                <span className="add-booking__summaryLabel">{t("Provider")}</span>
                <span>{selectedProviderName}</span>
              </div>
              <div>
                <span className="add-booking__summaryLabel">{t("Date")}</span>
                <span>{formatDate(date)}</span>
              </div>
              <div>
                <span className="add-booking__summaryLabel">{t("Time")}</span>
                <span>{selectedSlot ? formatTime(selectedSlot.startTime) : "—"}</span>
              </div>
            </div>

            <div className="add-booking__grid">
              <div className="add-booking__field">
                <label htmlFor="customerName">{t("Customer name")}</label>
                <input
                  id="customerName"
                  className="input"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>

              <div className="add-booking__field">
                <label htmlFor="customerPhone">{t("Customer phone")}</label>
                <input
                  id="customerPhone"
                  className="input"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  maxLength={30}
                  placeholder={t("+44 …")}
                />
              </div>

              <div className="add-booking__field">
                <label htmlFor="note">{t("Note (optional)")}</label>
                <textarea
                  id="note"
                  className="textarea"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={280}
                />
              </div>
            </div>

            {submitStatus === "error" && (
              <p className="add-booking__state add-booking__state--error">{submitError}</p>
            )}
            {submitStatus === "error" && conflictHint && (
              <p className="add-booking__state add-booking__state--warning">{conflictHint}</p>
            )}
            {submitStatus === "success" && (
              <p className="add-booking__state add-booking__state--success">
                {t("Booking created. Redirecting to calendar…")}
              </p>
            )}

            <div className="add-booking__actions">
              <button
                className="btn btn--primary"
                type="button"
                onClick={handleConfirm}
                disabled={submitStatus === "saving"}
              >
                {submitStatus === "saving" ? t("Creating booking…") : t("Confirm booking")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddBooking;
