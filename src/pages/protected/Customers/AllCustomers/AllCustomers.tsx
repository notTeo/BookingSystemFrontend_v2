import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { listCustomers } from "../../../../api/customers";
import type { Customer } from "../../../../types/customers";
import { useI18n } from "../../../../i18n";
import "./AllCustomers.css";

const AllCustomers: React.FC = () => {
  const { shopName } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await listCustomers({ limit: 100 });
        if (!alive) return;
        setCustomers(data.items ?? []);
      } catch (err) {
        if (!alive) return;
        const message = err instanceof Error ? err.message : t("Unable to load customers.");
        setError(message);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [t]);

  const filtered = useMemo(() => {
    if (!query.trim()) return customers;
    const q = query.toLowerCase();
    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(q) ||
        customer.phone.toLowerCase().includes(q) ||
        (customer.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [customers, query]);

  return (
    <div className="customersPage">
      <div className="customersPage__inner">
        <header className="customersPage__header">
          <div>
            <h1 className="customersPage__title">{t("Customers")}</h1>
            <p className="customersPage__subtitle">
              {t("Browse, search, and open customer profiles.")}
            </p>
          </div>
        </header>

        <div className="customersPage__filters">
          <div className="customersPage__search">
            <label htmlFor="customerSearch">{t("Search")}</label>
            <input
              id="customerSearch"
              placeholder={t("Search by name, phone, or email")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="customersPage__count">{filtered.length}</div>
        </div>

        <section className="customersPage__panel">

          {loading && <div className="customersPage__state">{t("Loading customers…")}</div>}
          {!loading && error && (
            <div className="customersPage__state customersPage__state--error">{error}</div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="customersPage__state">{t("No customers found.")}</div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="customersPage__tableWrap">
              <table className="customersPage__table">
                <thead>
                  <tr>
                    <th>{t("Name")}</th>
                    <th>{t("Phone")}</th>
                    <th>{t("Email")}</th>
                    <th>{t("Status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((customer) => {
                    const link =
                      shopName && customer.id
                        ? `/shops/${encodeURIComponent(shopName)}/customers/${customer.id}`
                        : "";
                    return (
                      <tr
                        key={customer.id}
                        className="customersPage__row"
                        role="button"
                        tabIndex={0}
                        onClick={() => link && navigate(link)}
                        onKeyDown={(event) => {
                          if (!link) return;
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            navigate(link);
                          }
                        }}
                      >
                        <td>{customer.name}</td>
                        <td>{customer.phone}</td>
                        <td>{customer.email ?? "—"}</td>
                        <td>
                          <span
                            className={`customersPage__pill ${
                              customer.banned ? "customersPage__pill--banned" : "customersPage__pill--active"
                            }`}
                          >
                            {customer.banned ? t("Banned") : t("Active")}
                          </span>
                        </td>
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

export default AllCustomers;
