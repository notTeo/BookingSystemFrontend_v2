import React from "react";
import { Link } from "react-router-dom";

import "./Overview.css";
import { setActiveShopId } from "../../../api/http";
import { useAuth } from "../../../providers/AuthProvider";
import { useI18n } from "../../../i18n";

const Overview: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();

  if (!user) {
    return (
      <div className="overview overview--loading">
        <p>{t("Loading...")}</p>
      </div>
    );
  }

  const getRoleClass = (role?: string) => {
    switch (role) {
      case "OWNER":
        return "owner";
      case "MANAGER":
        return "manager";
      case "STAFF":
        return "staff";
      default:
        return "default";
    }
  };

  const planClass = `overview__plan-pill overview__plan-pill--${user.subscription}`;

  return (
    <div className="overview">
      <div className="overview__inner">
        {/* Page header (simple) */}
        <header className="overview__page-header">
          <div>
            <h1 className="overview__title">{t("Overview")}</h1>
            <p className="overview__subtitle">{t("Snapshot of your account and shops.")}</p>
          </div>
        </header>

        {/* Profile hero card */}
        <section className="overview__card overview__profile-card">
          <div className="overview__profile-top">
            <div className="overview__profile-left">
              <div className="overview__avatar">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>

              <div className="overview__profile-main">
                <p className="overview__name">
                  {user.firstName} {user.lastName}
                </p>
                <p className="overview__email">{user.email}</p>
                <p className="overview__profile-sub">
                  {t("Managing")} {user.shops.length}{" "}
                  {user.shops.length === 1 ? t("shop") : t("shops")}.
                </p>
              </div>
            </div>

            <div className="overview__profile-right">
              <span className={planClass}>
                {user.subscription} {t("plan")}
              </span>
              <Link to="/new-shop" className="btn btn--primary btn--sm">
                {t("Create shop")}
              </Link>
            </div>
          </div>

          <div className="overview__profile-stats">
            <div className="overview__stat">
              <div className="overview__stat-label">{t("Shops")}</div>
              <div className="overview__stat-value">{user.shops.length}</div>
            </div>

            <div className="overview__stat">
              <div className="overview__stat-label">{t("Subscription")}</div>
              <div className="overview__stat-value">{user.subscription}</div>
            </div>

            <div className="overview__stat">
              <div className="overview__stat-label">{t("Account")}</div>
              <div className="overview__stat-value">{t("Active")}</div>
            </div>
          </div>
        </section>

        {/* Shops */}
        <section className="overview__card overview__card--shops">
          <div className="overview__shops-header">
            <h2 className="overview__section-title">{t("Your shops")}</h2>
            <span className="overview__shops-count">{user.shops.length}</span>
          </div>

          {user.shops.length === 0 ? (
            <p className="overview__empty">{t("You haven't created any shops yet.")}</p>
          ) : (
            <ul className="overview__shops-grid">
              {user.shops.map((shop) => {
                const roleKey = getRoleClass(shop.role);
                return (
                  <li
                    key={shop.id}
                    className={`overview__shop-card overview__shop-card--${roleKey}`}
                  >
                    <Link
                      to={`/shops/${shop.name}`}
                      onClick={() => {
                        setActiveShopId(shop.id);
                      }}
                      className="overview__shop-link"
                    >
                      <div className="overview__shop-title-row">
                        <span className="overview__shop-name">{shop.name}</span>
                        <span className={`overview__role-pill overview__role-pill--${roleKey}`}>
                          {shop.role}
                        </span>
                      </div>
                      <p className="overview__shop-subtext">{t("Click to manage this shop.")}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default Overview;
