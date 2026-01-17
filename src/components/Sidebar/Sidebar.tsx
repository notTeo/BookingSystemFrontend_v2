import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Settings,
  Store,
  Users,
} from "lucide-react";

import { setActiveShopId } from "../../api/http";
import { useAuth } from "../../providers/AuthProvider";
import { useShop } from "../../providers/ShopProvider";
import { useI18n } from "../../i18n";
import "./Sidebar.css";

const SideBar: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentShop, setCurrentShop } = useShop();
  const { t } = useI18n();

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
        aria-label={t("Menu")}
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
          <button type="button" className="app-sidebar__close" onClick={close} aria-label={t("Close")}>
            <span />
            <span />
          </button>

          {/* Title – show shop name when in shop mode */}
          <h2 className="app-sidebar__title">
            {hasActiveShop ? (currentShop?.shop.name ?? t("Shop")) : t("Dashboard")}
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
              aria-label={t("Back")}
              title={t("Back")}
            >
              <ArrowLeft className="icon" aria-hidden="true" />
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
                <LayoutDashboard className="icon" aria-hidden="true" />
                {t("Shop Overview")}
              </NavLink>
            </li>

            <li className="app-sidebar__item">
              <NavLink
                to={`/shops/${currentShop?.shop.name}/calendar`}
                onClick={close}
                className={linkClass}
              >
                <CalendarDays className="icon" aria-hidden="true" />
                {t("Calendar")}
              </NavLink>
            </li>

            <li className="app-sidebar__item">
              <NavLink
                to={`/shops/${currentShop?.shop.name}/team`}
                onClick={close}
                className={linkClass}
              >
                <Users className="icon" aria-hidden="true" />
                {t("Team")}
              </NavLink>
            </li>

            <li className="app-sidebar__item">
              <NavLink
                to={`/shops/${currentShop?.shop.name}/customers`}
                onClick={close}
                className={linkClass}
              >
                <Users className="icon" aria-hidden="true" />
                {t("Customers")}
              </NavLink>
            </li>

            <li className="app-sidebar__item">
              <NavLink
                to={`/shops/${currentShop?.shop.name}/services`}
                onClick={close}
                className={linkClass}
              >
                <Briefcase className="icon" aria-hidden="true" />
                {t("Services")}
              </NavLink>
            </li>

            <li className="app-sidebar__item">
              <NavLink
                to={`/shops/${currentShop?.shop.name}/settings`}
                onClick={close}
                className={linkClass}
              >
                <Settings className="icon" aria-hidden="true" />
                {t("Settings")}
              </NavLink>
            </li>
          </ul>
        ) : (
          <ul className="app-sidebar__list">
            <li className="app-sidebar__item">
              <NavLink to="/overview" onClick={close} className={linkClass} end>
                <Home className="icon" aria-hidden="true" />
                {t("Overview")}
              </NavLink>
            </li>

            <li className="app-sidebar__item">
              <NavLink to="/inbox" onClick={close} className={linkClass}>
                <Inbox className="icon" aria-hidden="true" />
                {t("Inbox")}
              </NavLink>
            </li>

            <li className="app-sidebar__item">
              <NavLink to="/shops" onClick={close} className={linkClass}>
                <Store className="icon" aria-hidden="true" />
                {t("All Shops")}
              </NavLink>
            </li>

            <li className="app-sidebar__item">
              <NavLink to="/new-shop" onClick={close} className={linkClass}>
                <PlusCircle className="icon" aria-hidden="true" />
                {t("Create Shop")}
              </NavLink>
            </li>

            {/* Single Settings item instead of Account + Billing */}
            <li className="app-sidebar__item">
              <NavLink to="/settings/account" onClick={close} className={linkClass}>
                <Settings className="icon" aria-hidden="true" />
                {t("Settings")}
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
            <LogOut className="icon" aria-hidden="true" />
            {t("Logout")}
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
