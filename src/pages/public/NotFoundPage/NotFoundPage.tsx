import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../../i18n";
import "./NotFoundPage.css";

const NotFoundPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <main className="nf">
      <section className="nf__card" aria-label={t("404 page not found")}>
        <div className="nf__badge">404</div>

        <h1 className="nf__title">{t("Page not found")}</h1>
        <p className="nf__subtitle">
          {t("The page you’re looking for doesn’t exist or was moved.")}
        </p>

        <div className="nf__actions">
          <Link className="btn btn--primary" to="/overview">
            {t("Go to dashboard")}
          </Link>
          <Link className="btn btn--ghost" to="/">
            {t("Back to home")}
          </Link>
        </div>

        <p className="nf__hint">{t("If you typed the address, check for typos.")}</p>
      </section>
    </main>
  );
};

export default NotFoundPage;
