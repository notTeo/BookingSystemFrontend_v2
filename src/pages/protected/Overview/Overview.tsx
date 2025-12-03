import React from "react";
import { Link } from "react-router-dom";
import "./Overview.css";
import { useAuth } from "../../../providers/AuthProvider";

const Overview: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="overview overview--loading">
        <p>Loading...</p>
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
        <header className="overview__header">
          <div>
            <h1 className="overview__title">Overview</h1>
            <p className="overview__subtitle">
              Snapshot of your account and shops.
            </p>
          </div>

          <div className="overview__header-actions">
            <span className={planClass}>{user.subscription} plan</span>
            <Link
              to="/shops/new"
              className="btn btn--primary btn--sm overview__create-btn"
            >
              Create shop
            </Link>
          </div>
        </header>

        {/* Single profile card (no duplicate account card) */}
        <section className="overview__card overview__card--profile">
          <h2 className="overview__section-title">Profile</h2>
          <div className="overview__profile">
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
                Managing {user.shops.length}{" "}
                {user.shops.length === 1 ? "shop" : "shops"}.
              </p>
            </div>
          </div>
        </section>

        {/* Shops grid – small boxes */}
        <section className="overview__card overview__card--shops">
          <div className="overview__shops-header">
            <h2 className="overview__section-title">Your shops</h2>
          </div>

          {user.shops.length === 0 ? (
            <p className="overview__empty">
              You haven&apos;t created any shops yet.
            </p>
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
                      to={`/shops/${encodeURIComponent(shop.name)}`}
                      className="overview__shop-link"
                    >
                      <div className="overview__shop-title-row">
                        <span className="overview__shop-name">
                          {shop.name}
                        </span>
                        <span
                          className={`overview__role-pill overview__role-pill--${roleKey}`}
                        >
                          {shop.role}
                        </span>
                      </div>
                      <p className="overview__shop-subtext">
                        Click to manage this shop.
                      </p>
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
