import React from "react";
import { Link } from "react-router-dom";
import "./NotFoundPage.css";

const NotFoundPage: React.FC = () => {
  return (
    <main className="nf">
      <section className="nf__card" aria-label="404 page not found">
        <div className="nf__badge">404</div>

        <h1 className="nf__title">Page not found</h1>
        <p className="nf__subtitle">The page you’re looking for doesn’t exist or was moved.</p>

        <div className="nf__actions">
          <Link className="btn btn--primary" to="/overview">
            Go to dashboard
          </Link>
          <Link className="btn btn--ghost" to="/">
            Back to home
          </Link>
        </div>

        <p className="nf__hint">If you typed the address, check for typos.</p>
      </section>
    </main>
  );
};

export default NotFoundPage;
