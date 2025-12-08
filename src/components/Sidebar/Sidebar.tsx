import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../../providers/AuthProvider";
import { useShop } from "../../providers/ShopProvider";
import { setActiveShopId } from "../../api/http";
import "./Sidebar.css";

const SideBar: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentShop, setCurrentShop } = useShop();

  const [open, setOpen] = useState(false);

  if (!user) return null;

  const hasActiveShop = Boolean(currentShop);

  const close = () => setOpen(false);
  const toggle = () => setOpen((v) => !v);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `app-sidebar__link ${isActive ? "app-sidebar__link--active" : ""}`;

  return (
    <>
      {/* Burger (mobile only via CSS) */}
      <button
        type="button"
        className={`app-sidebar-burger ${open ? "is-open" : ""}`}
        onClick={toggle}
        aria-label="Menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Backdrop */}
      <div className={`app-sidebar-backdrop ${open ? "is-open" : ""}`} onClick={close} />

      {/* Drawer / Sidebar */}
      <aside className={`app-sidebar ${open ? "is-open" : ""}`}>
        <div className="app-sidebar__header">
          {/* X LEFT */}
          <button type="button" className="app-sidebar__close" onClick={close} aria-label="Close">
            <span />
            <span />
          </button>

          {/* Title – show shop name when in shop mode */}
          <h2 className="app-sidebar__title">
            {hasActiveShop ? currentShop?.shop.name ?? "Shop" : "Dashboard"}
          </h2>

          {/* BACK RIGHT */}
          {hasActiveShop ? (
            <Link
              className="app-sidebar__back app-sidebar__back--icon"
              to="/overview"
              onClick={() => {
                setActiveShopId(null);
                setCurrentShop(null);
                close();
              }}
              aria-label="Back"
              title="Back"
            >
              ‹
            </Link>
          ) : (
            <span className="app-sidebar__back app-sidebar__back--spacer" />
          )}
        </div>

        {hasActiveShop ? (
          <ul className="app-sidebar__list">
            <li className="app-sidebar__item">
              <NavLink
                to={`/shops/${currentShop?.shop.name}`}
                onClick={close}
                className={linkClass}
                end
              >
                Shop Overview
              </NavLink>
            </li>

            <li className="app-sidebar__item">
              <NavLink    
                to={`/shops/${currentShop?.shop.name}/settings`}
                onClick={close}
                className={linkClass}
              >
                Settings
              </NavLink>
            </li>

            <li className="app-sidebar__item">
              <NavLink
                to={`/shops/${currentShop?.shop.name}/calendar`}
                onClick={close}
                className={linkClass}
              >
                Calendar
              </NavLink>
            </li>

            <li className="app-sidebar__item">
              <NavLink
                to={`/shops/${currentShop?.shop.name}/team`}
                onClick={close}
                className={linkClass}
              >
                Team
              </NavLink>
            </li>

            <li className="app-sidebar__item">
              <NavLink
                to={`/shops/${currentShop?.shop.name}/services`}
                onClick={close}
                className={linkClass}
              >
                Services
              </NavLink>
            </li>
          </ul>
        ) : (
          <ul className="app-sidebar__list">
            <li className="app-sidebar__item">
              <NavLink to="/overview" onClick={close} className={linkClass} end>
                Overview
              </NavLink>
            </li>

            <li className="app-sidebar__item">
              <NavLink to="/inbox" onClick={close} className={linkClass}>
                Inbox
              </NavLink>
            </li>

            <li className="app-sidebar__item">
              <NavLink to="/shops" onClick={close} className={linkClass}>
                All Shops
              </NavLink>
            </li>

            <li className="app-sidebar__item">
              <NavLink to="/new-shop" onClick={close} className={linkClass}>
                Create Shop
              </NavLink>
            </li>

            {/* Single Settings item instead of Account + Billing */}
            <li className="app-sidebar__item">
              <NavLink to="/settings/account" onClick={close} className={linkClass}>
                Settings
              </NavLink>
            </li>
          </ul>
        )}

        <div className="app-sidebar__footer">
          <div className="app-sidebar__user">
            <h4 className="overview__avatar">
              {user.firstName.toUpperCase().charAt(0)} {user.lastName.toUpperCase().charAt(0)}
            </h4>
            <div className="app-sidebar__user__info">
              <div>
                {user.firstName} {user.lastName}
              </div>
              {user.subscription}
            </div>
          </div>

          <button
            className="btn btn--ghost btn--sm app-sidebar__logout"
            onClick={() => {
              logout();
              setActiveShopId(null);
              setCurrentShop(null);
              close();
            }}
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
