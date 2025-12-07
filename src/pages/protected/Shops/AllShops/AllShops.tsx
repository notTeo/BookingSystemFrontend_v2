import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { listUserShops } from "../../../../api/shop";
import { setActiveShopId } from "../../../../api/http";
import type { ShopSummary } from "../../../../types";

import "./AllShops.css";

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

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const AllShops: React.FC = () => {
  const [shops, setShops] = useState<ShopSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadShops = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await listUserShops();
        setShops(response ?? []);
      } catch (err) {
        console.error("Failed to load shops", err);
        setError("Unable to load shops right now. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadShops();
  }, []);

  const stats = useMemo(() => {
    const total = shops.length;
    const active = shops.filter((shop) => shop.active).length;
    const owners = shops.filter((shop) => shop.role === "OWNER").length;
    const bookable = shops.filter((shop) => shop.bookable).length;

    const mostRecentUpdate = shops.reduce<string | undefined>((latest, shop) => {
      if (!shop.updatedAt) return latest;
      if (!latest) return shop.updatedAt;
      return new Date(shop.updatedAt) > new Date(latest) ? shop.updatedAt : latest;
    }, undefined);

    return { total, active, owners, bookable, mostRecentUpdate };
  }, [shops]);

  const handleRowClick = (shop: ShopSummary) => {
    setActiveShopId(shop.id);
    navigate(`/shops/${shop.name}`);
  };

  return (
    <div className="all-shops">
      <div className="all-shops__inner">
        <header className="all-shops__header">
          <div>
            <h1 className="all-shops__title">All shops overview</h1>
            <p className="all-shops__subtitle">
              View every shop you&apos;re part of, switch context, and jump into management.
            </p>
          </div>
          <Link to="/new-shop" className="btn btn--primary all-shops__cta">
            Create shop
          </Link>
        </header>

        <section className="all-shops__stats">
          <div className="all-shops__stat-card card">
            <p className="all-shops__stat-label">Total shops</p>
            <p className="all-shops__stat-value">{stats.total}</p>
            <p className="all-shops__stat-meta">You&apos;re a member of {stats.total} shop(s).</p>
          </div>
          <div className="all-shops__stat-card card">
            <p className="all-shops__stat-label">Active</p>
            <p className="all-shops__stat-value">{stats.active}</p>
            <p className="all-shops__stat-meta">Currently enabled locations.</p>
          </div>
          <div className="all-shops__stat-card card">
            <p className="all-shops__stat-label">Owner roles</p>
            <p className="all-shops__stat-value">{stats.owners}</p>
            <p className="all-shops__stat-meta">Shops where you&apos;re listed as OWNER.</p>
          </div>
          <div className="all-shops__stat-card card">
            <p className="all-shops__stat-label">Bookable slots</p>
            <p className="all-shops__stat-value">{stats.bookable}</p>
            <p className="all-shops__stat-meta">Shops marked bookable for you.</p>
          </div>
        </section>

        <section className="card all-shops__table-card">
          <div className="all-shops__table-head">
            <div>
              <h2 className="all-shops__table-title">Your shops</h2>
              <p className="all-shops__table-subtitle">Click a row to open that shop.</p>
            </div>
            <p className="all-shops__last-updated">
              Last updated: {formatDate(stats.mostRecentUpdate)}
            </p>
          </div>

          {isLoading ? (
            <p className="all-shops__state">Loading shops...</p>
          ) : error ? (
            <p className="all-shops__state all-shops__state--error">{error}</p>
          ) : shops.length === 0 ? (
            <div className="all-shops__empty">
              <p>No shops yet.</p>
              <p className="all-shops__empty-sub">Create your first location to start managing it.</p>
            </div>
          ) : (
            <div className="all-shops__table-wrapper">
              <table className="all-shops__table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Bookable</th>
                    <th>Address</th>
                    <th>Created</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {shops.map((shop) => {
                    const roleClass = getRoleClass(shop.role);
                    return (
                      <tr
                        key={shop.id}
                        className="all-shops__row"
                        onClick={() => handleRowClick(shop)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleRowClick(shop);
                          }
                        }}
                      >
                        <td>
                          <div className="all-shops__name">{shop.name}</div>
                          <p className="all-shops__subtext">Click to manage this shop</p>
                        </td>
                        <td>
                          <span className={`all-shops__role all-shops__role--${roleClass}`}>
                            {shop.role ?? "Member"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`all-shops__pill all-shops__pill--${shop.active ? "success" : "muted"}`}
                          >
                            {shop.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`all-shops__pill all-shops__pill--${shop.bookable ? "accent" : "muted"}`}
                          >
                            {shop.bookable ? "Bookable" : "Not bookable"}
                          </span>
                        </td>
                        <td className="all-shops__address">{shop.address ?? "—"}</td>
                        <td>{formatDate(shop.createdAt)}</td>
                        <td>{formatDate(shop.updatedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AllShops;