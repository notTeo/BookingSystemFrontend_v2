import { LayoutDashboard, LogIn, LogOut, UserPlus } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useI18n } from "../../i18n";
import { useAuth } from "../../providers/AuthProvider";
import "./TopBar.css";

const TopBar: React.FC = () => {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const pendingSectionRef = useRef<string | null>(null);
  const navId = "public-nav";

  const closeMenu = () => setIsMenuOpen(false);

  const getNavOffset = useCallback(() => {
    const value = getComputedStyle(document.documentElement).getPropertyValue("--nav-height");
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? 64 : parsed;
  }, []);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      const target = document.getElementById(sectionId);
      if (!target) {
        return;
      }
      const offset = getNavOffset() + 12;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    },
    [getNavOffset],
  );

  const handleSectionClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    sectionId: string,
  ) => {
    event.preventDefault();
    pendingSectionRef.current = sectionId;
    closeMenu();

    if (location.pathname === "/" && location.hash === `#${sectionId}`) {
      scrollToSection(sectionId);
      pendingSectionRef.current = null;
      return;
    }

    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`);
      return;
    }

    navigate({ pathname: "/", hash: `#${sectionId}` });
  };

  useEffect(() => {
    if (location.pathname !== "/") {
      return;
    }

    const hash = location.hash.replace("#", "");
    const pending = pendingSectionRef.current;
    const target = pending || hash;

    if (!target) {
      return;
    }

    pendingSectionRef.current = null;
    requestAnimationFrame(() => scrollToSection(target));
  }, [location.hash, location.pathname, scrollToSection]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 641px)");

    const handleChange = () => {
      setIsDesktop(mediaQuery.matches);
      if (mediaQuery.matches) {
        setIsMenuOpen(false);
      }
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const nav = navRef.current;
    const toggleEl = toggleRef.current;
    const focusables = nav
      ? Array.from(
          nav.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        )
      : [];

    if (focusables.length > 0) {
      focusables[0].focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        toggleEl?.focus();
        return;
      }

      if (event.key !== "Tab" || focusables.length === 0) {
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !nav?.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      toggleEl?.focus();
    };
  }, [isMenuOpen]);

  return (
    <header className="public__topbar">
      <div className="public__topbarInner">
        <Link to="/" className="public__brand">
          BookingSystem
        </Link>

        <div
          className={`public__navOverlay ${isMenuOpen ? "is-open" : ""}`}
          role="presentation"
          onClick={closeMenu}
        />
        <nav
          id={navId}
          className={`public__nav ${isMenuOpen ? "is-open" : ""}`}
          aria-label="Primary"
          aria-hidden={!isMenuOpen && !isDesktop}
          ref={navRef}
        >
          <button
            type="button"
            className="public__drawerClose"
            aria-label={t("Close menu")}
            onClick={closeMenu}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
          <div className="public__navSection public__navSection--links">


            <Link
              className="public__navLink"
              to="/#features"
              onClick={(e) => handleSectionClick(e, "features")}
            >
              {t("Features")}
            </Link>
            <Link
              className="public__navLink"
              to="/#pricing"
              onClick={(e) => handleSectionClick(e, "pricing")}
            >
              {t("Pricing")}
            </Link>
            <Link className="public__navLink" to="/#faq" onClick={(e) => handleSectionClick(e, "faq")}>
              {t("FAQ")}
            </Link>
          </div>

          <div className="public__navSection public__navSection--lang">
            <div className="public__lang">
              <button
                type="button"
                className={`public__langBtn ${lang === "en" ? "is-active" : ""}`}
                onClick={() => setLang("en")}
                aria-pressed={lang === "en"}
              >
                🇬🇧
              </button>
              <button
                type="button"
                className={`public__langBtn ${lang === "el" ? "is-active" : ""}`}
                onClick={() => setLang("el")}
                aria-pressed={lang === "el"}
              >
                🇬🇷
              </button>
            </div>
          </div>

          <div className="public__navSection public__navSection--actions">
            {user ? (
              <>
                <Link className="btn btn--ghost" to="/overview" onClick={closeMenu}>
                  <LayoutDashboard className="icon" aria-hidden="true" />
                  {t("Overview")}
                </Link>
                <button
                  className="btn btn--primary app-topbar__logout"
                  type="button"
                  onClick={() => {
                    closeMenu();
                    logout();
                  }}
                >
                  <LogOut className="icon" aria-hidden="true" />
                  {t("Logout")}
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn--ghost" to="/login" onClick={closeMenu}>
                  <LogIn className="icon" aria-hidden="true" />
                  {t("Log in")}
                </Link>
                <Link className="btn btn--primary" to="/register" onClick={closeMenu}>
                  <UserPlus className="icon" aria-hidden="true" />
                  {t("Register")}
                </Link>
              </>
            )}
          </div>
        </nav>

        <button
          type="button"
          className={`public__menuToggle ${isMenuOpen ? "is-open" : ""}`}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls={navId}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          ref={toggleRef}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
