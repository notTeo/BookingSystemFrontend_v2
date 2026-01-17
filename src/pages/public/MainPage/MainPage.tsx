import { CalendarClock, Layers, Sparkles } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

import "./MainPage.css";
import { useI18n } from "../../../i18n";

const MainPage: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="landing">
      <main className="landing__main">
        {/* HERO */}
        <section className="landing__hero" id="top">
          <div className="landing__heroInner">
            <div className="landing__heroLeft">
              <p className="landing__eyebrow">{t("Modern bookings for multi-shop teams")}</p>

              <h1 className="landing__title">
                {t("Calendar, services, customers, and staff — one clean workspace.")}
              </h1>

              <p className="landing__subtitle">
                {t(
                  "Plan your day in the calendar, manage services and availability, and track customers across locations. Everything stays fast, scoped, and simple.",
                )}
              </p>

              <div className="landing__ctaRow">
                <Link className="btn btn--primary" to="/register">
                  {t("Create account")}
                </Link>
                <Link className="btn btn--ghost" to="/login">
                  {t("Log in")}
                </Link>
              </div>

              <div className="landing__trustRow">
                <div className="landing__trustItem">{t("No double bookings")}</div>
                <div className="landing__trustItem">{t("Staff availability")}</div>
                <div className="landing__trustItem">{t("Customer history")}</div>
              </div>
            </div>

            <div className="landing__heroRight" aria-label="Preview">
              <div className="landing__preview card">
                <div className="landing__previewTop">
                  <div>
                    <div className="landing__previewTitle">{t("Today")}</div>
                    <div className="landing__previewSub">{t("Shop calendar")}</div>
                  </div>
                  <span className="landing__pill landing__pill--accent">{t("Live")}</span>
                </div>

                <div className="landing__previewRows">
                  <div className="landing__previewRow">
                    <span className="landing__badge">09:30</span>
                    <div className="landing__previewInfo">
                      <div className="landing__previewName">{t("Haircut")}</div>
                      <div className="landing__previewMeta">{t("Nick • 30m • Barber 1")}</div>
                    </div>
                    <span className="landing__status">{t("Confirmed")}</span>
                  </div>

                  <div className="landing__previewRow">
                    <span className="landing__badge">11:00</span>
                    <div className="landing__previewInfo">
                      <div className="landing__previewName">{t("Beard trim")}</div>
                      <div className="landing__previewMeta">{t("Alex • 20m • Barber 2")}</div>
                    </div>
                    <span className="landing__status landing__status--muted">{t("Pending")}</span>
                  </div>
                </div>

                <div className="landing__previewStats">
                  <div className="landing__stat">
                    <div className="landing__statLabel">{t("Bookings")}</div>
                    <div className="landing__statValue">18</div>
                  </div>
                  <div className="landing__stat">
                    <div className="landing__statLabel">{t("Customers")}</div>
                    <div className="landing__statValue">124</div>
                  </div>
                  <div className="landing__stat">
                    <div className="landing__statLabel">{t("No-shows")}</div>
                    <div className="landing__statValue">1</div>
                  </div>
                </div>
              </div>

              <div className="landing__miniGrid">
                <div className="landing__miniCard card">
                  <div className="landing__miniTitle">{t("Working hours")}</div>
                  <div className="landing__miniRow">
                    <span>{t("Mon")}</span>
                    <strong>{t("09:00–17:00")}</strong>
                  </div>
                  <div className="landing__miniRow">
                    <span>{t("Tue")}</span>
                    <strong>{t("09:00–17:00")}</strong>
                  </div>
                </div>
                <div className="landing__miniCard card">
                  <div className="landing__miniTitle">{t("Customers")}</div>
                  <div className="landing__miniRow">
                    <span>{t("Jamie L.")}</span>
                    <strong>{t("3 bookings")}</strong>
                  </div>
                  <div className="landing__miniRow">
                    <span>{t("Chris R.")}</span>
                    <strong>{t("2 bookings")}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW */}
        <section className="landing__section" id="workflow">
          <div className="landing__sectionHead">
            <h2 className="landing__h2">{t("How it fits your day")}</h2>
            <p className="landing__muted">{t("A simple flow that matches the dashboard.")}</p>
          </div>

          <div className="landing__workflowSplit">
            <div className="landing__workflowPanel">
              <div className="landing__workflowItem">
                <div className="landing__workflowIcon">
                  <CalendarClock className="icon" aria-hidden="true" />
                </div>
                <div>
                  <div className="landing__eyebrow">{t("Step 1")}</div>
                  <h3 className="landing__h3">{t("Set services & hours")}</h3>
                  <p className="landing__muted">
                    {t("Define services, durations, and working hours for each shop.")}
                  </p>
                </div>
              </div>

              <div className="landing__workflowItem">
                <div className="landing__workflowIcon">
                  <Layers className="icon" aria-hidden="true" />
                </div>
                <div>
                  <div className="landing__eyebrow">{t("Step 2")}</div>
                  <h3 className="landing__h3">{t("Assign team members")}</h3>
                  <p className="landing__muted">
                    {t("Keep availability accurate with per-member hours and booking status.")}
                  </p>
                </div>
              </div>

              <div className="landing__workflowItem">
                <div className="landing__workflowIcon">
                  <Sparkles className="icon" aria-hidden="true" />
                </div>
                <div>
                  <div className="landing__eyebrow">{t("Step 3")}</div>
                  <h3 className="landing__h3">{t("Book and manage")}</h3>
                  <p className="landing__muted">
                    {t("Create bookings, manage statuses, and review customer history.")}
                  </p>
                </div>
              </div>
            </div>

            <div className="landing__workflowAside">
              <div className="landing__workflowPunch">{t("Run a tighter day")}</div>
              <p className="landing__muted">
                {t(
                  "Everything lines up from staff hours to live availability, so every booking lands where it should.",
                )}
              </p>
              <div className="landing__workflowPoints">
                <div className="landing__workflowPoint">{t("Live availability sync")}</div>
                <div className="landing__workflowPoint">{t("Team-ready scheduling")}</div>
                <div className="landing__workflowPoint">{t("Less admin overhead")}</div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="landing__section" id="features">
          <div className="landing__sectionHead">
            <h2 className="landing__h2">{t("Core features")}</h2>
            <p className="landing__muted">{t("Only what shops actually need.")}</p>
          </div>

          <div className="landing__featureSplit">
            <div className="landing__featureStack">
              <div className="landing__featureRow">
                <div className="landing__featureIcon">01</div>
                <div>
                  <h3 className="landing__h3">{t("Availability")}</h3>
                  <p className="landing__muted">
                    {t("Weekly hours, closed days, and split shifts. Turn hours into bookable time.")}
                  </p>
                </div>
              </div>
              <div className="landing__featureRow">
                <div className="landing__featureIcon">02</div>
                <div>
                  <h3 className="landing__h3">{t("Bookings")}</h3>
                  <p className="landing__muted">
                    {t("Prevent overlaps, manage status, and let owners create appointments too.")}
                  </p>
                </div>
              </div>
              <div className="landing__featureRow">
                <div className="landing__featureIcon">03</div>
                <div>
                  <h3 className="landing__h3">{t("Multi-shop")}</h3>
                  <p className="landing__muted">
                    {t("One account can run multiple shops with clean context switching.")}
                  </p>
                </div>
              </div>
            </div>

            <div className="landing__featurePanel">
              <div className="landing__featureTitle">{t("Built for owners")}</div>
              <p className="landing__muted">
                {t(
                  "Fast switching, clear status, and a calendar that stays readable when days get busy.",
                )}
              </p>
              <div className="landing__featureBadges">
                <span>{t("No overlaps")}</span>
                <span>{t("Live status")}</span>
                <span>{t("Team scopes")}</span>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="landing__section" id="pricing">
          <div className="landing__sectionHead">
            <h2 className="landing__h2">{t("Pricing")}</h2>
            <p className="landing__muted">{t("Simple. Upgrade anytime.")}</p>
          </div>

          <div className="landing__pricing">
            <div className="landing__priceCard card">
              <div className="landing__plan">{t("Member")}</div>
              <div className="landing__priceLine">
                <span className="landing__priceNum">€15</span>
                <span className="landing__priceUnit">/mo</span>
              </div>
              <ul className="landing__bullets">
                <li>{t("1 shop")}</li>
                <li>{t("Calendar + bookings")}</li>
                <li>{t("Services")}</li>
              </ul>
              <Link className="btn btn--ghost landing__priceBtn" to="/register">
                {t("Start")}
              </Link>
            </div>

            <div className="landing__priceCard card landing__priceCard--featured">
              <div className="landing__ribbon">{t("Most popular")}</div>
              <div className="landing__plan">{t("Starter")}</div>
              <div className="landing__priceLine">
                <span className="landing__priceNum">€25</span>
                <span className="landing__priceUnit">/mo</span>
              </div>
              <ul className="landing__bullets">
                <li>{t("Up to 2 shops")}</li>
                <li>{t("Team management")}</li>
                <li>{t("Advanced hours")}</li>
              </ul>
              <Link className="btn btn--primary landing__priceBtn" to="/register">
                {t("Start")}
              </Link>
            </div>

            <div className="landing__priceCard card">
              <div className="landing__plan">{t("Pro")}</div>
              <div className="landing__priceLine">
                <span className="landing__priceNum">€35</span>
                <span className="landing__priceUnit">/mo</span>
              </div>
              <ul className="landing__bullets">
                <li>{t("Up to 5 shops")}</li>
                <li>{t("Roles")}</li>
                <li>{t("Priority support")}</li>
              </ul>
              <Link className="btn btn--ghost landing__priceBtn" to="/register">
                {t("Start")}
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="landing__section" id="faq">
          <div className="landing__sectionHead">
            <h2 className="landing__h2">{t("FAQ")}</h2>
            <p className="landing__muted">{t("Quick answers.")}</p>
          </div>

          <div className="landing__faq">
            <details className="landing__faqItem card">
              <summary>{t("Can owners create bookings manually?")}</summary>
              <p className="landing__muted">
                {t(
                  "Yes. Owners can add bookings from the dashboard in addition to online customer bookings.",
                )}
              </p>
            </details>

            <details className="landing__faqItem card">
              <summary>{t("Can I run multiple shops under one account?")}</summary>
              <p className="landing__muted">
                {t("Yes. You can manage multiple shops with clean shop switching and scoped data.")}
              </p>
            </details>

            <details className="landing__faqItem card">
              <summary>{t("Can I upgrade later?")}</summary>
              <p className="landing__muted">
                {t("Yes. Plans are designed to upgrade without changing your setup.")}
              </p>
            </details>
          </div>
        </section>

        {/* Bottom CTA (single place) */}
        <section className="landing__bottomCta">
          <div className="landing__bottomInner card">
            <div>
              <h2 className="landing__h2">{t("Start with one shop")}</h2>
              <p className="landing__muted">{t("Create an account and test it in minutes.")}</p>
            </div>
            <div className="landing__ctaRow">
              <Link className="btn btn--primary" to="/register">
                {t("Create account")}
              </Link>
              <Link className="btn btn--ghost" to="/login">
                {t("Log in")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing__footer">
        <div className="landing__footerInner">
          <span className="landing__muted">
            © {new Date().getFullYear()} BookingSaaS
          </span>
          <div className="landing__footerLinks">
            <a className="landing__navLink" href="#pricing">
              {t("Pricing")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;
