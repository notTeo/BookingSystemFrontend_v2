import React, { useEffect, useMemo, useState } from "react";
import "./Calendar.css";
import type {
  BookingStatus,
  BookingWithRelations,
  ListBookingParams,
  Service,
} from "../../../../types";
import { listBookings } from "../../../../api/bookings";
import { listServices } from "../../../../api/services";

// team (same APIs you already use in AllTeam)
import { getActiveShopId } from "../../../../api/http";
import { getTeamOverview } from "../../../../api/team";
import type { TeamMemberSummary, TeamOverview } from "../../../../types/team";

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "CANCELED"] as const;

type ServiceRow = Service & {
  category?: string | null;
  offeredByCount?: number;
};

type DraftFilters = {
  status: "" | (typeof STATUS_OPTIONS)[number];
  serviceId: string; // dropdown string -> number on apply
  providerId: string; // dropdown string -> number on apply
  day: string; // YYYY-MM-DD
};

// Build a clean "one day" [from,to) range in ISO.
// from = local day 00:00
// to   = next day 00:00 (exclusive)
function buildDayRangeIso(day: string): { from: string; to: string } | null {
  if (!day) return null;

  const [yStr, mStr, dStr] = day.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (!y || !m || !d) return null;

  const start = new Date(y, m - 1, d, 0, 0, 0, 0);
  const end = new Date(y, m - 1, d + 1, 0, 0, 0, 0);

  return { from: start.toISOString(), to: end.toISOString() };
}

const Calendar: React.FC = () => {
  const shopId = getActiveShopId();

  const [draft, setDraft] = useState<DraftFilters>({
    status: "",
    serviceId: "",
    providerId: "",
    day: "",
  });

  const [applied, setApplied] = useState<ListBookingParams>({});
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [services, setServices] = useState<ServiceRow[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string>("");

  const [overview, setOverview] = useState<TeamOverview | null>(null);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState<string>("");

  const providers = useMemo(() => {
    const members = overview?.members ?? [];
    // Most common: only show bookable + active people as providers
    return members
      .slice()
      .filter((m) => m.bookable && m.active)
      .sort((a, b) => a.firstName.localeCompare(b.firstName));
  }, [overview]);

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

    const range = buildDayRangeIso(draft.day);
    if (range) {
      p.from = range.from;
      p.to = range.to;
    }

    return p;
  }, [draft]);

  const applyFilters = () => {
    const next: ListBookingParams = {};

    if (draft.status) next.status = draft.status as unknown as BookingStatus;

    if (draft.serviceId.trim()) {
      const n = Number(draft.serviceId);
      if (!Number.isNaN(n)) next.serviceId = n;
    }

    if (draft.providerId.trim()) {
      const n = Number(draft.providerId);
      if (!Number.isNaN(n)) next.providerId = n;
    }

    const range = buildDayRangeIso(draft.day);
    if (range) {
      next.from = range.from;
      next.to = range.to;
    }

    setApplied(next);
  };

  const resetFilters = () => {
    setDraft({ status: "", serviceId: "", providerId: "", day: "" });
    setApplied({});
  };

  // bookings loader (runs when "applied" changes)
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
        setError(e?.message || "Failed to load bookings.");
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
  }, [applied]);

  // services loader (runs once)
  useEffect(() => {
    const loadServices = async () => {
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
          err instanceof Error ? err.message : "Unable to load services. Please try again.";
        setServicesError(message);
      } finally {
        setServicesLoading(false);
      }
    };

    loadServices();
  }, []);

  // providers loader (team members)
  useEffect(() => {
    const loadProviders = async () => {
      if (!shopId) {
        setProvidersError("Select a shop to load providers.");
        setOverview(null);
        return;
      }

      setProvidersLoading(true);
      setProvidersError("");

      try {
        const data = await getTeamOverview();
        setOverview(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load providers.";
        setProvidersError(message);
        setOverview(null);
      } finally {
        setProvidersLoading(false);
      }
    };

    loadProviders();
  }, [shopId]);

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <h1 className="calendar-title">Calendar</h1>
        <p className="calendar-subtitle">Bookings</p>
      </div>

      <div className="card calendar-filters">
        <div className="row calendar-filters__row">
          <div className="field calendar-filters__field">
            <label>Status</label>
            <select
              className="select"
              value={draft.status}
              onChange={(e) =>
                setDraft((d) => ({ ...d, status: e.target.value as DraftFilters["status"] }))
              }
            >
              <option value="">All</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="field calendar-filters__field">
            <label>Service</label>
            <select
              className="select"
              value={draft.serviceId}
              onChange={(e) => setDraft((d) => ({ ...d, serviceId: e.target.value }))}
              disabled={servicesLoading}
            >
              <option value="">{servicesLoading ? "Loading services..." : "All services"}</option>
              {services.map((svc) => (
                <option key={svc.id} value={String(svc.id)}>
                  {svc.name}
                </option>
              ))}
            </select>
            {servicesError ? <small style={{ color: "var(--text-muted)" }}>{servicesError}</small> : null}
          </div>

          <div className="field calendar-filters__field">
            <label>Provider</label>
            <select
              className="select"
              value={draft.providerId}
              onChange={(e) => setDraft((d) => ({ ...d, providerId: e.target.value }))}
              disabled={providersLoading || !shopId}
            >
              <option value="">
                {providersLoading ? "Loading providers..." : "All providers"}
              </option>

              {providers.map((m: TeamMemberSummary) => (
                <option
                  key={m.shopUserId ?? m.id}
                  value={String(m.shopUserId)} // <-- if backend expects userId, change to String(m.userId)
                >
                  {m.firstName} {m.lastName}
                </option>
              ))}
            </select>
            {providersError ? <small style={{ color: "var(--text-muted)" }}>{providersError}</small> : null}
          </div>

          <div className="field calendar-filters__field">
            <label>Day</label>
            <input
              className="input"
              type="date"
              value={draft.day}
              onChange={(e) => setDraft((d) => ({ ...d, day: e.target.value }))}
            />
          </div>

          <div className="row calendar-filters__actions">
            <button className="btn btn--primary" onClick={applyFilters}>
              Apply
            </button>
            <button className="btn btn--ghost" onClick={resetFilters}>
              Reset
            </button>
          </div>
        </div>

        <div className="calendar-filters__preview">
          <div className="calendar-filters__preview-label">Payload</div>
          <pre className="calendar-filters__code">{JSON.stringify(payloadPreview, null, 2)}</pre>
        </div>
      </div>

      <div className="card calendar-results">
        <div className="calendar-results__header">
          <h2 className="calendar-results__title">Results</h2>
          <div className="calendar-results__meta">{loading ? "Loading…" : `Count: ${bookings.length}`}</div>
        </div>

        {error && <div className="calendar-alert calendar-alert--error">{error}</div>}

        {!loading && !error && bookings.length === 0 && (
          <div className="calendar-alert">No bookings match your filters.</div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="calendar-list">
            {bookings.map((b: any) => {
              const id = b.id ?? "(no id)";
              const status = b.status ?? "";
              const start = b.startAt ?? b.startsAt ?? b.date ?? b.datetime ?? b.createdAt ?? "";
              const serviceName = b.service?.name ?? b.serviceName ?? "";
              const providerName = b.provider?.firstName
                ? `${b.provider.firstName} ${b.provider.lastName ?? ""}`.trim()
                : (b.providerName ?? "");

              return (
                <div key={id} className="calendar-item">
                  <div className="calendar-item__top">
                    <div className="calendar-item__id">#{id}</div>
                    {status && <div className="badge">{status}</div>}
                  </div>

                  <div className="calendar-item__body">
                    {start && <div className="calendar-item__line">Start: {String(start)}</div>}
                    {serviceName && <div className="calendar-item__line">Service: {serviceName}</div>}
                    {providerName && <div className="calendar-item__line">Provider: {providerName}</div>}
                  </div>

                  <details className="calendar-item__debug">
                    <summary>Raw</summary>
                    <pre>{JSON.stringify(b, null, 2)}</pre>
                  </details>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
