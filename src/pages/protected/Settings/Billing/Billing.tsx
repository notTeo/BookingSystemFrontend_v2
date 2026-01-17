import React from "react";
import { useI18n } from "../../../../i18n";
import "./Billing.css";

const Billing: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="billingPage">
      <div className="billingPage__inner">
        <header className="billingPage__header">
          <div>
            <p className="billingPage__eyebrow">{t("Settings")}</p>
            <h1 className="billingPage__title">{t("Billing")}</h1>
            <p className="billingPage__subtitle">
              {t("Manage subscriptions, invoices, and payment methods.")}
            </p>
          </div>
        </header>

        <section className="card billingPage__card">
          <div className="billingPage__empty">
            <h2>{t("Billing is not configured yet")}</h2>
            <p>
              {t(
                "When billing is enabled, you’ll be able to update your plan, manage payment methods, and review invoices here.",
              )}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Billing;
