import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

import "./ShopOverview.css";
import { getActiveShopId } from "../../../../api/http";
import { useShop } from "../../../../providers/ShopProvider";
import { useI18n } from "../../../../i18n";

function formatMoneyEUR(n: number) {
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(safe);
}

function dayLabel(d: string) {
  return d.slice(0, 3).toUpperCase();
}

function statusLabel(s: string) {
  return String(s).replaceAll("_", " ");
}

const WEEK_ORDER: Record<string, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

const dayOrder = (d: unknown) => WEEK_ORDER[String(d).toUpperCase()] ?? 999;

const ShopOverviewPage: React.FC = () => {
  const shopId = getActiveShopId();
  const { currentShop, isLoading, refreshShop } = useShop();
  const { t } = useI18n();

  useEffect(() => {
    if (!shopId) return;
    refreshShop();
  }, [shopId, refreshShop]);

  const hours = useMemo(
    () => currentShop?.workingHours ?? currentShop?.shop?.workingHours ?? [],
    [currentShop],
  );
  const recent = useMemo(() => currentShop?.recentBookings ?? [], [currentShop]);

  if (!shopId) return <p className="shopOv__state">{t("No shop selected.")}</p>;
  if (isLoading) return <p className="shopOv__state">{t("Loading shop…")}</p>;
  if (!currentShop) return <p className="shopOv__state">{t("Shop not found or not loaded.")}</p>;

  const { shop, totalBookings, activeServices, teamMembers, monthlyRevenue } = currentShop;

  return (
    <div className="shopOv">
      <header className="shopOv__header">
        <div className="shopOv__headMain">
          <div>
            <h1 className="shopOv__title">{shop.name}</h1>
            <p className="shopOv__subtitle">
              {shop.address ? shop.address : t("No address set")}
            </p>
          </div>

          <div className="shopOv__actions">
            <Link
              className="btn btn--ghost"
              to={`/shops/${encodeURIComponent(shop.name)}/calendar`}
            >
              {t("Calendar")}
            </Link>
            <Link className="btn btn--primary" to={`/shops/${encodeURIComponent(shop.name)}/settings`}>
              {t("Manage")}
            </Link>
          </div>
        </div>
      </header>

      <section className="shopOv__kpis" aria-label="Shop stats">
        <div className="shopOv__kpi card">
          <div className="shopOv__kpiLabel">{t("Total bookings")}</div>
          <div className="shopOv__kpiValue">{totalBookings}</div>
          <div className="shopOv__kpiHint">{t("All time")}</div>
        </div>

        <div className="shopOv__kpi card">
          <div className="shopOv__kpiLabel">{t("Monthly revenue")}</div>
          <div className="shopOv__kpiValue">{formatMoneyEUR(monthlyRevenue)}</div>
          <div className="shopOv__kpiHint">{t("This month")}</div>
        </div>

        <div className="shopOv__kpi card">
          <div className="shopOv__kpiLabel">{t("Team members")}</div>
          <div className="shopOv__kpiValue">{teamMembers}</div>
          <div className="shopOv__kpiHint">{t("Active staff")}</div>
        </div>

        <div className="shopOv__kpi card">
          <div className="shopOv__kpiLabel">{t("Active services")}</div>
          <div className="shopOv__kpiValue">{activeServices}</div>
          <div className="shopOv__kpiHint">{t("Bookable")}</div>
        </div>
      </section>

      <div className="shopOv__grid">
        {/* Working hours */}
        <section className="shopOv__card card" aria-label="Working hours">
          <div className="shopOv__cardHead">
            <div>
              <h2>{t("Working hours")}</h2>
              <p>{t("Weekly opening hours used for bookings.")}</p>
            </div>
            <Link
              className="btn btn--ghost"
              to={`/shops/${encodeURIComponent(shop.name)}/settings`}
            >
              {t("Edit")}
            </Link>
          </div>

          {hours.length ? (
            <div className="shopOv__hours">
              {hours
                .slice()
                .sort((a, b) => dayOrder(a.dayOfWeek) - dayOrder(b.dayOfWeek))
                .map((h) => (
                  <div key={`${h.dayOfWeek}-${h.id ?? "x"}`} className="shopOv__hoursRow">
                    <div className="shopOv__day">{dayLabel(String(h.dayOfWeek))}</div>
                    {h.isClosed ? (
                      <div className="shopOv__closedPill">{t("Closed")}</div>
                    ) : (
                      <div className="shopOv__time">
                        {h.openTime} – {h.closeTime}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="shopOv__empty">
              {t("No working hours set yet. Add hours so customers can book.")}
            </div>
          )}
        </section>

        {/* Recent bookings */}
        <section className="shopOv__card card" aria-label="Recent bookings">
          <div className="shopOv__cardHead">
            <div>
              <h2>{t("Recent bookings")}</h2>
              <p>{t("Latest appointments for this shop.")}</p>
            </div>
            <Link
              className="btn btn--ghost"
              to={`/shops/${encodeURIComponent(shop.name)}/bookings`}
            >
              {t("View all")}
            </Link>
          </div>

          {recent.length ? (
            <div className="shopOv__table">
              <div className="shopOv__tableHead">
                <div>{t("Customer")}</div>
                <div>{t("Service")}</div>
                <div>{t("Staff")}</div>
                <div>{t("Date")}</div>
                <div>{t("Status")}</div>
              </div>

              {recent.slice(0, 8).map((b) => (
                <div key={b.id} className="shopOv__tableRow">
                  <div className="shopOv__cellMain">{b.name}</div>
                  <div className="shopOv__cellMuted">{b.serviceName}</div>
                  <div className="shopOv__cellMuted">
                    {b.staffFirstName} {b.staffLastName}
                  </div>
                  <div className="shopOv__cellMuted">{new Date(b.date).toLocaleString()}</div>
                  <div>
                    <span
                      className={`shopOv__pill shopOv__pill--${String(b.status).toLowerCase()}`}
                    >
                      {statusLabel(String(b.status))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="shopOv__empty">{t("No bookings yet.")}</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ShopOverviewPage;
