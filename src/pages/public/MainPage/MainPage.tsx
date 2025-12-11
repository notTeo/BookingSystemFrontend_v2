import React from "react";
import { Link } from "react-router-dom";
import "./MainPage.css";

const MainPage: React.FC = () => {
  return (
    <div className="landing">
      <main className="landing__main">
        {/* HERO */}
        <section className="landing__hero">
          <div className="landing__heroInner">
            <div className="landing__heroLeft">
              <p className="landing__eyebrow">White-label bookings for barbershops & salons</p>

              <h1 className="landing__title">
                Booking + staff + services — in one clean dashboard.
              </h1>

              <p className="landing__subtitle">
                Run schedules, avoid overlaps, and manage bookings per shop. Sell subscriptions,
                keep the UI fast and simple.
              </p>

              {/* No CTA here — top bar already has Login/Register or Overview/Logout */}
              <div className="landing__trustRow">
                <div className="landing__trustItem">No double bookings</div>
                <div className="landing__trustItem">Multi-shop ready</div>
                <div className="landing__trustItem">Owner manual bookings</div>
              </div>
            </div>

            <div className="landing__heroRight" aria-label="Preview">
              <div className="landing__preview card">
                <div className="landing__previewTop">
                  <div>
                    <div className="landing__previewTitle">Today</div>
                    <div className="landing__previewSub">Shop calendar overview</div>
                  </div>
                  <span className="landing__pill landing__pill--accent">Live</span>
                </div>

                <div className="landing__previewRows">
                  <div className="landing__previewRow">
                    <span className="landing__badge">09:30</span>
                    <div className="landing__previewInfo">
                      <div className="landing__previewName">Haircut</div>
                      <div className="landing__previewMeta">Nick • 30m • Barber 1</div>
                    </div>
                    <span className="landing__status">Confirmed</span>
                  </div>

                  <div className="landing__previewRow">
                    <span className="landing__badge">11:00</span>
                    <div className="landing__previewInfo">
                      <div className="landing__previewName">Beard</div>
                      <div className="landing__previewMeta">Alex • 15m • Barber 2</div>
                    </div>
                    <span className="landing__status landing__status--muted">Pending</span>
                  </div>
                </div>

                <div className="landing__previewStats">
                  <div className="landing__stat">
                    <div className="landing__statLabel">Bookings</div>
                    <div className="landing__statValue">18</div>
                  </div>
                  <div className="landing__stat">
                    <div className="landing__statLabel">Revenue</div>
                    <div className="landing__statValue">€420</div>
                  </div>
                  <div className="landing__stat">
                    <div className="landing__statLabel">No-shows</div>
                    <div className="landing__statValue">1</div>
                  </div>
                </div>
              </div>

              <p className="landing__note">
                Simple preview. Your real UI matches your dashboard theme.
              </p>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="landing__section">
          <div className="landing__sectionHead">
            <h2 className="landing__h2">Core features</h2>
            <p className="landing__muted">Only what shops actually need.</p>
          </div>

          <div className="landing__grid landing__grid--3">
            <div className="landing__feature card">
              <h3 className="landing__h3">Availability</h3>
              <p className="landing__muted">
                Weekly hours, closed days, and split shifts. Turn hours into bookable time.
              </p>
            </div>

            <div className="landing__feature card">
              <h3 className="landing__h3">Bookings</h3>
              <p className="landing__muted">
                Prevent overlaps, manage status, and let owners create appointments too.
              </p>
            </div>

            <div className="landing__feature card">
              <h3 className="landing__h3">Multi-shop</h3>
              <p className="landing__muted">
                One account can run multiple shops with clean context switching.
              </p>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="landing__section" id="pricing">
          <div className="landing__sectionHead">
            <h2 className="landing__h2">Pricing</h2>
            <p className="landing__muted">Simple. Upgrade anytime.</p>
          </div>

          <div className="landing__pricing">
            <div className="landing__priceCard card">
              <div className="landing__plan">Member</div>
              <div className="landing__priceLine">
                <span className="landing__priceNum">€15</span>
                <span className="landing__priceUnit">/mo</span>
              </div>
              <ul className="landing__bullets">
                <li>1 shop</li>
                <li>Calendar + bookings</li>
                <li>Services</li>
              </ul>
              <Link className="btn btn--ghost landing__priceBtn" to="/register">
                Start
              </Link>
            </div>

            <div className="landing__priceCard card landing__priceCard--featured">
              <div className="landing__ribbon">Most popular</div>
              <div className="landing__plan">Starter</div>
              <div className="landing__priceLine">
                <span className="landing__priceNum">€25</span>
                <span className="landing__priceUnit">/mo</span>
              </div>
              <ul className="landing__bullets">
                <li>Up to 2 shops</li>
                <li>Team management</li>
                <li>Advanced hours</li>
              </ul>
              <Link className="btn btn--primary landing__priceBtn" to="/register">
                Start
              </Link>
            </div>

            <div className="landing__priceCard card">
              <div className="landing__plan">Pro</div>
              <div className="landing__priceLine">
                <span className="landing__priceNum">€35</span>
                <span className="landing__priceUnit">/mo</span>
              </div>
              <ul className="landing__bullets">
                <li>Up to 5 shops</li>
                <li>Roles</li>
                <li>Priority support</li>
              </ul>
              <Link className="btn btn--ghost landing__priceBtn" to="/register">
                Start
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="landing__section">
          <div className="landing__sectionHead">
            <h2 className="landing__h2">FAQ</h2>
            <p className="landing__muted">Quick answers.</p>
          </div>

          <div className="landing__faq">
            <details className="landing__faqItem card">
              <summary>Can owners create bookings manually?</summary>
              <p className="landing__muted">
                Yes. Owners can add bookings from the dashboard in addition to online customer
                bookings.
              </p>
            </details>

            <details className="landing__faqItem card">
              <summary>Can I run multiple shops under one account?</summary>
              <p className="landing__muted">
                Yes. You can manage multiple shops with clean shop switching and scoped data.
              </p>
            </details>

            <details className="landing__faqItem card">
              <summary>Can I upgrade later?</summary>
              <p className="landing__muted">
                Yes. Plans are designed to upgrade without changing your setup.
              </p>
            </details>
          </div>
        </section>

        {/* Bottom CTA (single place) */}
        <section className="landing__bottomCta">
          <div className="landing__bottomInner card">
            <div>
              <h2 className="landing__h2">Start with one shop</h2>
              <p className="landing__muted">Create an account and test it in minutes.</p>
            </div>
            <div className="landing__ctaRow">
              <Link className="btn btn--primary" to="/register">
                Create account
              </Link>
              <Link className="btn btn--ghost" to="/login">
                Login
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing__footer">
        <div className="landing__footerInner">
          <span className="landing__muted">© {new Date().getFullYear()} BookingSaaS</span>
          <div className="landing__footerLinks">
            <a className="landing__navLink" href="#pricing">
              Pricing
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;
