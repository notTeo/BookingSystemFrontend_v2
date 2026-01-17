import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./Calendar.css";
import { Link, useParams } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  Clock,
  Grid2x2,
  List,
  RefreshCw,
  User,
  UserX,
  XCircle,
} from "lucide-react";

import type {
  BookingStatus,
  BookingWithRelations,
  ListBookingParams,
  Service,
} from "../../../../types";
import { listBookings, updateBookingStatus } from "../../../../api/bookings";
import { listServices } from "../../../../api/services";

import { getActiveShopId } from "../../../../api/http";
import { getTeamOverview } from "../../../../api/team";
import type { TeamMemberSummary, TeamOverview } from "../../../../types/team";
import { useI18n } from "../../../../i18n";

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "CANCELED", "NO_SHOW", "COMPLETED"] as const;
const STATUS_ACTIONS = ["CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELED"] as const;

/**
 * Grid config
 * Set SLOT_MINUTES=15 to match your slot system.
 */
const SLOT_MINUTES = 30;

/**
 * Default day view (change if you want)
 */
const WORK_START = 8 * 60; // 08:00
const WORK_END = 22 * 60; // 22:00

type ServiceRow = Service & {
  category?: string | null;
  offeredByCount?: number;
};

type DraftFilters = {
  status: "" | (typeof STATUS_OPTIONS)[number];
  serviceId: string;
  providerId: string; // shopUserId (string)
  day: string; // YYYY-MM-DD
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function todayYYYYMMDD(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Build day range using LOCAL midnight boundaries.
 */
function buildDayRangeIsoLocal(day: string): { from: string; to: string } | null {
  if (!day) return null;

  const [yStr, mStr, dStr] = day.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (!y || !m || !d) return null;

  const from = new Date(y, m - 1, d, 0, 0, 0, 0);
  const to = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
  return { from: from.toISOString(), to: to.toISOString() };
}

/**
 * Convert either:
 *  - "HH:MM"
 *  - ISO string
 * into minutes from midnight (LOCAL).
 */
function minutesFromValueLocal(value: string): number | null {
  if (!value) return null;

  const hm = value.match(/^(\d{1,2}):(\d{2})$/);
  if (hm) {
    const h = Number(hm[1]);
    const m = Number(hm[2]);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  }

  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return null;

  return dt.getHours() * 60 + dt.getMinutes();
}

function fmtTimeFromMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Provider key strategy:
 * - Providers list is shop-scoped and has shopUserId.
 * - Booking creation uses providerId from selectedSlot.providerId.
 * The most consistent mapping is providerId == shopUserId.
 */
function providerKeyFromMember(p: any): string | null {
  const v = p?.shopUserId ?? null;
  return v == null ? null : String(v);
}

function providerKeyFromBooking(b: any): string | null {
  const v =
    b?.providerId ??
    b?.providerShopUserId ??
    b?.shopUserId ??
    b?.provider?.shopUserId ??
    b?.provider?.shopUser?.id ??
    null;

  return v == null ? null : String(v);
}

function getStartVal(b: any): string | null {
  return (
    b?.startTime ??
    b?.startAt ??
    b?.startsAt ??
    b?.start ??
    b?.datetime ??
    b?.dateTime ??
    b?.date ??
    null
  );
}

function getEndVal(b: any): string | null {
  return b?.endTime ?? b?.endAt ?? b?.endsAt ?? b?.end ?? null;
}

type GridCell =
  | { kind: "empty" }
  | { kind: "booking"; booking: any; rowSpan: number }
  | { kind: "covered" };

function badgeClass(status: string | null | undefined): string {
  if (!status) return "cal-badge cal-badge--DEFAULT";

  switch (status) {
    case "PENDING":
    case "CONFIRMED":
    case "CANCELED":
    case "NO_SHOW":
    case "COMPLETED":
      return `cal-badge cal-badge--${status}`;
    default:
      return "cal-badge cal-badge--DEFAULT";
  }
}

function formatTimeLabel(value: string | null): string {
  if (!value) return "";
  const mins = minutesFromValueLocal(value);
  if (mins == null) return String(value);
  return fmtTimeFromMinutes(mins);
}

function statusActionIcon(status: (typeof STATUS_ACTIONS)[number]) {
  switch (status) {
    case "CONFIRMED":
      return <CheckCircle2 className="icon" aria-hidden="true" />;
    case "COMPLETED":
      return <Check className="icon" aria-hidden="true" />;
    case "NO_SHOW":
      return <UserX className="icon" aria-hidden="true" />;
    case "CANCELED":
      return <XCircle className="icon" aria-hidden="true" />;
    default:
      return null;
  }
}

const Calendar: React.FC = () => {
  const shopId = getActiveShopId();
  const { shopName } = useParams();
  const { t } = useI18n();

  const [draft, setDraft] = useState<DraftFilters>(() => ({
    status: "",
    serviceId: "",
    providerId: "",
    day: todayYYYYMMDD(),
  }));

  // Applied drives fetch + grid
  const [applied, setApplied] = useState<ListBookingParams>(() => {
    const r = buildDayRangeIsoLocal(todayYYYYMMDD());
    return r ? { from: r.from, to: r.to } : {};
  });

  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [services, setServices] = useState<ServiceRow[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string>("");

  const [overview, setOverview] = useState<TeamOverview | null>(null);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState<string>("");
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [statusUpdateError, setStatusUpdateError] = useState<string>("");


  // services loader (shop-scoped)
  useEffect(() => {
    const loadServices = async () => {
      if (!shopId) {
        setServices([]);
        setServicesError("");
        return;
      }

      setServicesLoading(true);
      setServicesError("");

      try {
        const data = await listServices();
        setServices(
          data.map((svc) => ({
            ...svc,
            category: (svc as ServiceRow).category ?? "",
            offeredByCount: (svc as ServiceRow).offeredByCount ?? 0,
          })),
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : t("Unable to load services. Please try again.");
        setServicesError(message);
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    };

    loadServices();
  }, [shopId, t]);

  // providers loader
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

  const providers = useMemo(() => {
    const members = overview?.members ?? [];
    return members
      .slice()
      .filter((member) => member.active && member.bookable)
      .sort((a, b) => a.firstName.localeCompare(b.firstName));
  }, [overview]);

  // bookings loader (runs when applied changes)
  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await listBookings(applied);
        if (!alive) return;
        setBookings(data);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || t("Failed to load bookings."));
        setBookings([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [applied, t]);

  const payloadPreview = useMemo(() => {
    const p: ListBookingParams = {};

    if (draft.status) p.status = draft.status as unknown as BookingStatus;

    if (draft.serviceId.trim()) {
      const n = Number(draft.serviceId);
      if (!Number.isNaN(n)) p.serviceId = n;
    }

    if (draft.providerId.trim()) {
      const n = Number(draft.providerId);
      if (!Number.isNaN(n)) p.providerId = n;
    }

    const range = buildDayRangeIsoLocal(draft.day);
    if (range) {
      p.from = range.from;
      p.to = range.to;
    }

    return p;
  }, [draft]);

  const applyFilters = useCallback(() => {
    setApplied(payloadPreview);
  }, [payloadPreview]);

  const resetFilters = useCallback(() => {
    const d = todayYYYYMMDD();
    const r = buildDayRangeIsoLocal(d);

    setDraft({ status: "", serviceId: "", providerId: "", day: d });
    setApplied(r ? { from: r.from, to: r.to } : {});
  }, []);

  // Day navigation (fast calendar workflow)
  const shiftDay = useCallback(
    (deltaDays: number) => {
      const [yStr, mStr, dStr] = draft.day.split("-");
      const y = Number(yStr);
      const m = Number(mStr);
      const d = Number(dStr);
      if (!y || !m || !d) return;

      const next = new Date(y, m - 1, d + deltaDays, 0, 0, 0, 0);
      const nextDay = `${next.getFullYear()}-${pad2(next.getMonth() + 1)}-${pad2(next.getDate())}`;

      const range = buildDayRangeIsoLocal(nextDay);

      setDraft((prev) => ({ ...prev, day: nextDay }));
      setApplied((prev) => ({
        ...prev,
        ...(range ? { from: range.from, to: range.to } : {}),
      }));
    },
    [draft.day],
  );

  // IMPORTANT: grid columns reflect APPLIED provider filter (not draft)
  const appliedProviderId = useMemo(() => {
    const v = (applied as any)?.providerId;
    return v == null || v === "" ? "" : String(v);
  }, [applied]);

  const visibleProviders = useMemo(() => {
    if (!appliedProviderId) return providers;
    return providers.filter((p) => String(p.shopUserId) === appliedProviderId);
  }, [providers, appliedProviderId]);

  // time slots for the table rows
  const timeSlots = useMemo(() => {
    const slots: number[] = [];
    for (let m = WORK_START; m < WORK_END; m += SLOT_MINUTES) slots.push(m);
    return slots;
  }, []);

  // Build grid: providerKey -> rowIndex -> cell
  const grid = useMemo(() => {
    const providerKeys = visibleProviders
      .map(providerKeyFromMember)
      .filter(Boolean) as string[];

    const byProvider: Record<string, GridCell[]> = {};
    for (const k of providerKeys) {
      byProvider[k] = timeSlots.map(() => ({ kind: "empty" as const }));
    }

    for (const b of bookings as any[]) {
      const providerKey = providerKeyFromBooking(b);
      if (!providerKey || !byProvider[providerKey]) continue;

      const startVal = getStartVal(b);
      if (!startVal) continue;

      const startMin = minutesFromValueLocal(startVal);
      if (startMin == null) continue;

      let endMin: number | null = null;

      const endVal = getEndVal(b);
      if (endVal) endMin = minutesFromValueLocal(endVal);

      if (endMin == null) {
        const dur =
          b?.service?.durationMinutes ??
          b?.service?.durationMin ??
          b?.durationMinutes ??
          b?.durationMin ??
          null;

        const durMin = typeof dur === "number" && dur > 0 ? dur : SLOT_MINUTES;
        endMin = startMin + durMin;
      }

      const clampedStart = clamp(startMin, WORK_START, WORK_END);
      const clampedEnd = clamp(endMin, WORK_START, WORK_END);
      if (clampedEnd <= WORK_START || clampedStart >= WORK_END) continue;

      const startIdx = Math.floor((clampedStart - WORK_START) / SLOT_MINUTES);
      const span = Math.max(1, Math.ceil((clampedEnd - clampedStart) / SLOT_MINUTES));

      if (startIdx < 0 || startIdx >= byProvider[providerKey].length) continue;

      // If already occupied, skip (simple rule)
      if (byProvider[providerKey][startIdx]?.kind !== "empty") continue;

      byProvider[providerKey][startIdx] = { kind: "booking", booking: b, rowSpan: span };

      for (let i = 1; i < span; i++) {
        const idx = startIdx + i;
        if (idx >= 0 && idx < byProvider[providerKey].length) {
          byProvider[providerKey][idx] = { kind: "covered" };
        }
      }
    }

    return byProvider;
  }, [bookings, visibleProviders, timeSlots]);

  const onChangeStatusClick = useCallback(
    async (booking: BookingWithRelations, nextStatus: BookingStatus) => {
      if (!booking?.id || booking.status === nextStatus) return;
      setStatusUpdateError("");
      setStatusUpdatingId(booking.id);

      try {
        const updated = await updateBookingStatus(booking.id, nextStatus);
        setBookings((prev) =>
          prev.map((b) => (b.id === booking.id ? { ...b, ...updated } : b)),
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : t("Failed to update booking status.");
        setStatusUpdateError(message);
      } finally {
        setStatusUpdatingId(null);
      }
    },
    [t],
  );

  const sortedBookings = useMemo(() => {
    return bookings
      .slice()
      .sort((a, b) => {
        const aStart = getStartVal(a) ?? "";
        const bStart = getStartVal(b) ?? "";
        return aStart.localeCompare(bStart);
      });
  }, [bookings]);

  const statusLabels = useMemo(
    () => ({
      PENDING: t("Pending"),
      CONFIRMED: t("Confirmed"),
      CANCELED: t("Canceled"),
      NO_SHOW: t("No-show"),
      COMPLETED: t("Completed"),
    }),
    [t],
  );

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <div className="calendar-header__row">
          <div>
            <h1 className="calendar-title">{t("Calendar")}</h1>
            <p className="calendar-subtitle">{t("Bookings")}</p>
          </div>

          <div className="row calendar-header__actions">
            <button
              className="btn btn--ghost"
              onClick={() => shiftDay(-1)}
              disabled={loading}
              aria-label={t("Previous day")}
              title={t("Previous day")}
            >
              <ChevronLeft className="icon" aria-hidden="true" />
            </button>
            <button
              className="btn btn--ghost"
              onClick={resetFilters}
              disabled={loading}
              aria-label={t("Today")}
              title={t("Today")}
            >
              <RefreshCw className="icon" aria-hidden="true" />
            </button>
            <button
              className="btn btn--ghost"
              onClick={() => shiftDay(1)}
              disabled={loading}
              aria-label={t("Next day")}
              title={t("Next day")}
            >
              <ChevronRight className="icon" aria-hidden="true" />
            </button>

            {shopName ? (
              <Link
                className="btn btn--primary"
                to={`/shops/${encodeURIComponent(shopName)}/bookings/new`}
              >
                <CalendarDays className="icon" aria-hidden="true" />
                {t("New booking")}
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="card calendar-filters">
        <div className="row calendar-filters__row">
          <div className="field calendar-filters__field">
            <label>{t("Status")}</label>
            <select
              className="select"
              value={draft.status}
              onChange={(e) =>
                setDraft((d) => ({ ...d, status: e.target.value as DraftFilters["status"] }))
              }
            >
              <option value="">{t("All")}</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {statusLabels[s]}
                </option>
              ))}
            </select>
          </div>

          <div className="field calendar-filters__field">
            <label>{t("Service")}</label>
            <select
              className="select"
              value={draft.serviceId}
              onChange={(e) => setDraft((d) => ({ ...d, serviceId: e.target.value }))}
              disabled={servicesLoading || !shopId}
            >
              <option value="">
                {!shopId
                  ? t("Select a shop first")
                  : servicesLoading
                    ? t("Loading services...")
                    : t("All services")}
              </option>
              {services.map((svc) => (
                <option key={svc.id} value={String(svc.id)}>
                  {svc.name}
                </option>
              ))}
            </select>
            {servicesError ? (
              <small style={{ color: "var(--text-muted)" }}>{servicesError}</small>
            ) : null}
          </div>

          <div className="field calendar-filters__field">
            <label>{t("Provider")}</label>
            <select
              className="select"
              value={draft.providerId}
              onChange={(e) => setDraft((d) => ({ ...d, providerId: e.target.value }))}
              disabled={providersLoading || !shopId}
            >
              <option value="">
                {providersLoading ? t("Loading providers...") : t("All providers")}
              </option>

              {providers.map((m: TeamMemberSummary) => (
                <option key={String(m.shopUserId ?? m.id)} value={String(m.shopUserId ?? "")}>
                  {m.firstName} {m.lastName}
                </option>
              ))}
            </select>

            {providersError ? (
              <small style={{ color: "var(--text-muted)" }}>{providersError}</small>
            ) : null}
          </div>

          <div className="field calendar-filters__field">
            <label>{t("Day")}</label>
            <input
              className="input"
              type="date"
              value={draft.day}
              onChange={(e) => setDraft((d) => ({ ...d, day: e.target.value }))}
            />
          </div>

          <div className="row calendar-filters__actions">
            <button className="btn btn--primary" onClick={applyFilters} disabled={loading}>
              {t("Apply")}
            </button>
            <button className="btn btn--ghost" onClick={resetFilters} disabled={loading}>
              {t("Reset")}
            </button>
          </div>
        </div>
      </div>

      <div className="card calendar-results">
        <div className="calendar-results__header">
          <h2 className="calendar-results__title">
            {viewMode === "grid" ? t("Day grid") : t("Day list")}
          </h2>
          <div className="calendar-results__actions">
            <div className="calendar-results__meta">
              {loading ? t("Loading…") : `${t("Bookings")}: ${bookings.length}`}
            </div>
            <button
              className="calendar-view-toggle"
              type="button"
              onClick={() => setViewMode((v) => (v === "grid" ? "list" : "grid"))}
              aria-label={viewMode === "grid" ? t("Switch to list view") : t("Switch to grid view")}
              title={viewMode === "grid" ? t("List view") : t("Grid view")}
            >
              {viewMode === "grid" ? (
                <List className="icon" aria-hidden="true" />
              ) : (
                <Grid2x2 className="icon" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {error && <div className="calendar-alert calendar-alert--error">{error}</div>}
        {statusUpdateError && (
          <div className="calendar-alert calendar-alert--error">{statusUpdateError}</div>
        )}

        {!loading && !error && !shopId && (
          <div className="calendar-alert">{t("Select a shop to load providers.")}</div>
        )}

        {!loading && !error && shopId && visibleProviders.length === 0 && (
          <div className="calendar-alert">{t("No active/bookable providers found.")}</div>
        )}

        {!loading && !error && shopId && visibleProviders.length > 0 && viewMode === "grid" && (
          <div className="calendar-grid-wrap">
            <table className="calendar-grid">
              <thead>
                <tr>
                  <th className="cal-th cal-th--time">{t("Time")}</th>
                  {visibleProviders.map((p) => {
                    const k = providerKeyFromMember(p);
                    if (!k) return null;

                    return (
                      <th key={k} className="cal-th">
                        <div className="cal-provider">
                          <div className="cal-provider__name">
                            {p.firstName} {p.lastName}
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {timeSlots.map((mins, rowIdx) => (
                  <tr key={mins}>
                    <td className="cal-td cal-td--time">{fmtTimeFromMinutes(mins)}</td>

                    {visibleProviders.map((p) => {
                      const key = providerKeyFromMember(p);
                      if (!key) return null;

                      const cell = grid[key]?.[rowIdx] ?? ({ kind: "empty" } as const);

                      if (cell.kind === "covered") return null;

                      if (cell.kind === "booking") {
                        const b = cell.booking;

                        const id = b.id ?? "";
                        const status = b.status ?? "";

                        const serviceName = b.service?.name ?? b.serviceName ?? t("Booking");
                        const statusLabel = status ? statusLabels[status as keyof typeof statusLabels] : "";
                        const customerName =
                          b.customerName ??
                          (b.customer?.firstName
                            ? `${b.customer.firstName} ${b.customer.lastName ?? ""}`.trim()
                            : "");
                        const customerPhone = b.customer?.phone ?? b.customerPhone ?? "";
                        const customerId = b.customer?.id ?? b.customerId;
                        const customerLink =
                          shopName && customerId
                            ? `/shops/${encodeURIComponent(shopName)}/customers/${customerId}`
                            : "";

                        return (
                          <td
                            key={`${key}-${mins}`}
                            className="cal-td cal-td--booked"
                            rowSpan={cell.rowSpan}
                          >
                            <div className="cal-booking">
                              <div className="cal-booking__top">
                                <div className="cal-booking__title">{serviceName}</div>
                                {status ? (
                                  <span className={badgeClass(String(status))}>
                                    {statusLabel || String(status)}
                                  </span>
                                ) : null}
                              </div>

                              <div className="cal-booking__meta">
                                {customerName ? (
                                  <div className="cal-booking__meta-row">
                                    <User className="icon" aria-hidden="true" />
                                    {customerLink ? (
                                      <Link className="cal-booking__link" to={customerLink}>
                                        {customerName}
                                      </Link>
                                    ) : (
                                      <span>{customerName}</span>
                                    )}
                                  </div>
                                ) : null}
                                {customerPhone ? (
                                  <div className="cal-booking__meta-row">
                                    <span className="cal-booking__phone">{customerPhone}</span>
                                  </div>
                                ) : null}
                                {id ? <div className="cal-booking__id">#{id}</div> : null}
                                {getStartVal(b) ? (
                                  <div className="cal-booking__meta-row">
                                    <Clock className="icon" aria-hidden="true" />
                                    <span>{formatTimeLabel(getStartVal(b))}</span>
                                  </div>
                                ) : null}
                              </div>

                              <div className="cal-booking__actions">
                                {STATUS_ACTIONS.map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    className=" cal-booking__action-btn"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      onChangeStatusClick(b, s);
                                    }}
                                    disabled={statusUpdatingId === b.id}
                                    aria-label={`${t("Mark as")} ${statusLabels[s] ?? s}`}
                                    title={`${t("Mark as")} ${statusLabels[s] ?? s}`}
                                  >
                                    {statusActionIcon(s)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </td>
                        );
                      }

                      return <td key={`${key}-${mins}`} className="cal-td cal-td--empty" />;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && shopId && viewMode === "list" && (
          <div className="calendar-list">
            {sortedBookings.length === 0 ? (
              <div className="calendar-alert">{t("No bookings for this day.")}</div>
            ) : (
              <div className="calendar-list__table-wrap">
                <table className="calendar-list__table">
                  <thead>
                    <tr>
                      <th>{t("Time")}</th>
                      <th>{t("Service")}</th>
                      <th>{t("Customer")}</th>
                      <th>{t("Status")}</th>
                      <th>{t("Provider")}</th>
                      <th className="calendar-list__actions-col">{t("Actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBookings.map((b) => {
                      const id = b.id ?? "";
                      const status = b.status ?? "";
                      const serviceName = b.service?.name ?? t("Booking");
                      const customerName =
                        b.customer?.name 
                      const customerPhone = b.customer?.phone ;
                      const customerId = b.customer?.id ?? b.customerId;
                      const customerLink =
                        shopName && customerId
                          ? `/shops/${encodeURIComponent(shopName)}/customers/${customerId}`
                          : "";
                      const providerName =
                        b.provider?.user?.firstName && b.provider?.user.lastName
                          ? `${b.provider.user?.firstName} ${b.provider.user?.lastName}`.trim()
                          : "";
                      const start = getStartVal(b);
                      const statusLabel = status ? statusLabels[status as keyof typeof statusLabels] : "";

                      return (
                        <tr key={String(id)}>
                          <td>{formatTimeLabel(start)}</td>
                          <td>{serviceName}</td>
                          <td>
                            {customerName ? (
                              customerLink ? (
                                <Link className="cal-booking__link" to={customerLink}>
                                  {customerName}
                                </Link>
                              ) : (
                                customerName
                              )
                            ) : (
                              "—"
                            )}
                            {customerPhone ? (
                              <div className="calendar-list__subtext">{customerPhone}</div>
                            ) : null}
                          </td>
                          <td>
                            {status ? (
                              <span className={badgeClass(status)}>{statusLabel || status}</span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td>{providerName || "—"}</td>
                          <td className="calendar-list__actions">
                            {STATUS_ACTIONS.map((s) => (
                              <button
                                key={s}
                                type="button"
                                className="cal-booking__action-btn"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onChangeStatusClick(b, s);
                                }}
                                disabled={statusUpdatingId === b.id}
                                aria-label={`${t("Mark as")} ${statusLabels[s] ?? s}`}
                                title={`${t("Mark as")} ${statusLabels[s] ?? s}`}
                              >
                                {statusActionIcon(s)}
                              </button>
                            ))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
