import React from "react";
import { Link } from "react-router-dom";
import "./MainPage.css";


const MainPage: React.FC = () => {
  return (
    <div className="landing">

      <main className="landing__main">
        {/* Hero */}
        <section className="landing__hero">
          <div className="landing__heroInner">
            <div className="landing__heroLeft">
              <p className="landing__eyebrow">White-label bookings for barbershops & salons</p>

              <h1 className="landing__title">
                Appointments, staff, services, and scheduling — in one dashboard.
              </h1>

              <p className="landing__subtitle">
                Let shops run their calendar, automate availability, and reduce no-shows. You sell
                subscriptions. They get a clean booking experience.
              </p>

              <div className="landing__ctaRow">
                <Link className="btn btn--primary" to="/register">
                  Create account
                </Link>
                <Link className="btn btn--ghost" to="/login">
                  I already have an account
                </Link>
              </div>

              <div className="landing__trustRow">
                <div className="landing__trustItem">
                  <span className="landing__dot landing__dot--blue" aria-hidden="true" />
                  Online bookings + manual bookings
                </div>
                <div className="landing__trustItem">
                  <span className="landing__dot" aria-hidden="true" />
                  Multi-shop ready
                </div>
                <div className="landing__trustItem">
                  <span className="landing__dot" aria-hidden="true" />
                  Clean, fast UI
                </div>
              </div>
            </div>

            <div className="landing__heroRight">
              <div className="landing__mockCard">
                <div className="landing__mockHeader">
                  <div className="landing__mockTitle">Today</div>
                  <div className="landing__pill landing__pill--accent">Live</div>
                </div>

                <div className="landing__mockList" role="list">
                  <div className="landing__mockRow" role="listitem">
                    <span className="landing__mockBadge">09:30</span>
                    <div className="landing__mockInfo">
                      <div className="landing__mockName">Haircut</div>
                      <div className="landing__mockMeta">Nick • 30m • Barber 1</div>
                    </div>
                    <span className="landing__status">Confirmed</span>
                  </div>

                  <div className="landing__mockRow" role="listitem">
                    <span className="landing__mockBadge">11:00</span>
                    <div className="landing__mockInfo">
                      <div className="landing__mockName">Beard</div>
                      <div className="landing__mockMeta">Alex • 15m • Barber 2</div>
                    </div>
                    <span className="landing__status landing__status--muted">Pending</span>
                  </div>

                  <div className="landing__mockRow" role="listitem">
                    <span className="landing__mockBadge">13:45</span>
                    <div className="landing__mockInfo">
                      <div className="landing__mockName">Haircut + Wash</div>
                      <div className="landing__mockMeta">Maria • 45m • Barber 1</div>
                    </div>
                    <span className="landing__status">Confirmed</span>
                  </div>
                </div>

                <div className="landing__mockFooter">
                  <div className="landing__miniStat">
                    <div className="landing__miniLabel">Bookings</div>
                    <div className="landing__miniValue">18</div>
                  </div>
                  <div className="landing__miniStat">
                    <div className="landing__miniLabel">Revenue</div>
                    <div className="landing__miniValue">€420</div>
                  </div>
                  <div className="landing__miniStat">
                    <div className="landing__miniLabel">No-shows</div>
                    <div className="landing__miniValue">1</div>
                  </div>
                </div>
              </div>

              <p className="landing__mockNote">
                Dummy preview. Your real UI stays consistent with your dashboard theme.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="landing__section">
          <div className="landing__sectionHead">
            <h2 className="landing__h2">What you get</h2>
            <p className="landing__muted">
              Core features that actually matter for a booking product.
            </p>
          </div>

          <div className="landing__grid">
            <div className="landing__feature card">
              <div className="landing__featureTop">
                <span className="landing__iconBox" aria-hidden="true" />
                <h3 className="landing__h3">Scheduling</h3>
              </div>
              <p className="landing__muted">
                Flexible working hours, breaks, and repeat rules. Turn availability into slots.
              </p>
            </div>

            <div className="landing__feature card">
              <div className="landing__featureTop">
                <span className="landing__iconBox" aria-hidden="true" />
                <h3 className="landing__h3">Services & staff</h3>
              </div>
              <p className="landing__muted">
                Assign services to employees, set durations, and keep everything scoped per shop.
              </p>
            </div>

            <div className="landing__feature card">
              <div className="landing__featureTop">
                <span className="landing__iconBox" aria-hidden="true" />
                <h3 className="landing__h3">Bookings</h3>
              </div>
              <p className="landing__muted">
                Prevent overlaps, manage status, and support owner-created bookings too.
              </p>
            </div>

            <div className="landing__feature card">
              <div className="landing__featureTop">
                <span className="landing__iconBox" aria-hidden="true" />
                <h3 className="landing__h3">Multi-shop SaaS</h3>
              </div>
              <p className="landing__muted">
                One user can manage multiple shops with clean shop context switching.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="landing__section" id="pricing">
          <div className="landing__sectionHead">
            <h2 className="landing__h2">Pricing</h2>
            <p className="landing__muted">Simple plans. Upgrade anytime.</p>
          </div>

          <div className="landing__pricing">
            <div className="landing__priceCard card">
              <div className="landing__priceTop">
                <span className="landing__plan landing__plan--member">Member</span>
                <div className="landing__price">
                  <span className="landing__priceNum">€15</span>
                  <span className="landing__priceUnit">/ month</span>
                </div>
                <p className="landing__muted">
                  For solo shops that want a clean booking flow.
                </p>
              </div>

              <ul className="landing__bullets">
                <li>1 shop</li>
                <li>Calendar + bookings</li>
                <li>Services & durations</li>
                <li>Basic support</li>
              </ul>

              <Link className="btn btn--ghost landing__priceBtn" to="/register">
                Choose Member
              </Link>
            </div>

            <div className="landing__priceCard card landing__priceCard--featured">
              <div className="landing__ribbon">Most popular</div>

              <div className="landing__priceTop">
                <span className="landing__plan landing__plan--starter">Starter</span>
                <div className="landing__price">
                  <span className="landing__priceNum">€25</span>
                  <span className="landing__priceUnit">/ month</span>
                </div>
                <p className="landing__muted">
                  For growing shops that need team + smoother operations.
                </p>
              </div>

              <ul className="landing__bullets">
                <li>Up to 2 shops</li>
                <li>Team management</li>
                <li>Advanced availability</li>
                <li>Priority support</li>
              </ul>

              <Link className="btn btn--primary landing__priceBtn" to="/register">
                Choose Starter
              </Link>
            </div>

            <div className="landing__priceCard card">
              <div className="landing__priceTop">
                <span className="landing__plan landing__plan--pro">Pro</span>
                <div className="landing__price">
                  <span className="landing__priceNum">€35</span>
                  <span className="landing__priceUnit">/ month</span>
                </div>
                <p className="landing__muted">
                  For multi-location businesses and serious management.
                </p>
              </div>

              <ul className="landing__bullets">
                <li>Up to 5 shops</li>
                <li>Role-based access</li>
                <li>Operational controls</li>
                <li>Fast support</li>
              </ul>

              <Link className="btn btn--ghost landing__priceBtn" to="/register">
                Choose Pro
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="landing__section">
          <div className="landing__sectionHead">
            <h2 className="landing__h2">FAQ</h2>
            <p className="landing__muted">Quick answers before you sign up.</p>
          </div>

          <div className="landing__faq">
            <details className="landing__faqItem card">
              <summary>Can owners create bookings manually?</summary>
              <p className="landing__muted">
                Yes. It supports both customer online booking and owner/manual booking flows.
              </p>
            </details>

            <details className="landing__faqItem card">
              <summary>Can I run multiple shops under one account?</summary>
              <p className="landing__muted">
                Yes. Shops are scoped properly, with shop switching and per-shop data isolation.
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

        {/* Bottom CTA */}
        <section className="landing__bottomCta">
          <div className="landing__bottomInner card">
            <div>
              <h2 className="landing__h2">Ready to test it with a real shop?</h2>
              <p className="landing__muted">
                Create an account and set up your first shop in minutes.
              </p>
            </div>
            <div className="landing__ctaRow">
              <Link className="btn btn--primary" to="/register">
                Start free
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
            <Link className="landing__navLink" to="/login">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;
