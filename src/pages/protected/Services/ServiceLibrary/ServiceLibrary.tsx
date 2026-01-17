import React, { useEffect, useMemo, useState } from "react";
import { createService, listServices, updateService } from "../../../../api/services";
import type { Service, ServicePayload } from "../../../../types/services";
import { useI18n } from "../../../../i18n";
import "./ServiceLibrary.css";

type ServiceStatus = "Active" | "Archived";

type ServiceRow = Service & {
  category?: string | null;
  offeredByCount?: number;
};

type ServiceFormState = {
  id?: number;
  name: string;
  description?: string;
  category?: string;
  duration: number;
  price?: number;
  active: boolean;
  offeredByCount?: number;
};

const defaultFormState: ServiceFormState = {
  name: "",
  description: "",
  category: "",
  duration: 30,
  price: undefined,
  active: true,
  offeredByCount: 0,
};

const ServiceLibrary: React.FC = () => {
  const { t } = useI18n();
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | ServiceStatus>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceRow | null>(null);
  const [formState, setFormState] = useState<ServiceFormState>(defaultFormState);
  const [archiveTarget, setArchiveTarget] = useState<ServiceRow | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    const loadServices = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await listServices();
        setServices(
          data.map((svc) => ({
            ...svc,
            category: (svc as ServiceRow).category ?? "",
            offeredByCount: (svc as ServiceRow).offeredByCount ?? 0,
          })),
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : t("Unable to load services. Please try again.");
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, [t]);

  const toStatusLabel = (service: ServiceRow): ServiceStatus =>
    service.active ? "Active" : "Archived";

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" ? true : toStatusLabel(service) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [services, searchTerm, statusFilter]);

  const resetForm = () => {
    setFormState(defaultFormState);
    setEditingService(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (service: ServiceRow) => {
    setEditingService(service);
    setFormState({
      id: service.id,
      name: service.name,
      description: service.description ?? "",
      category: service.category ?? "",
      duration: service.duration,
      price: service.price,
      active: service.active,
      offeredByCount: service.offeredByCount,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.name.trim()) {
      return;
    }

    const payload: ServicePayload = {
      name: formState.name.trim(),
      description: formState.description?.trim() || undefined,
      duration: Number(formState.duration) || 0,
      price: formState.price ?? 0,
      active: formState.active,
    };

    setIsSaving(true);
    setError(null);

    try {
      if (editingService?.id) {
        const updated = await updateService(editingService.id, payload);
        setServices((prev) =>
          prev.map((svc) => (svc.id === editingService.id ? { ...svc, ...updated, category: formState.category } : svc)),
        );
      } else {
        const created = await createService(payload);
        const newService: ServiceRow = { ...created, category: formState.category };
        setServices((prev) => [newService, ...prev]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : t("Unable to save service.");
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchiveRequest = (service: ServiceRow) => {
    setArchiveTarget(service);
  };

  const confirmArchive = async () => {
    if (!archiveTarget) return;

    setIsArchiving(true);
    setError(null);

    try {
      const updated = await updateService(archiveTarget.id, { active: false });
      setServices((prev) => prev.map((svc) => (svc.id === archiveTarget.id ? { ...svc, ...updated } : svc)));
      setArchiveTarget(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("Unable to archive service.");
      setError(message);
    } finally {
      setIsArchiving(false);
    }
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setArchiveTarget(null);
    resetForm();
  };

  const renderStatusPill = (status: ServiceStatus) => (
    <span className={`service-library__status-pill service-library__status-pill--${status.toLowerCase()}`}>
      {t(status)}
    </span>
  );

  const renderTable = () => {
    if (isLoading) {
      return (
        <div className="service-library__loading">
          <div className="service-library__skeleton-row" />
          <div className="service-library__skeleton-row" />
          <div className="service-library__skeleton-row" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="service-library__state service-library__state--error">
          <p>{error}</p>
          <button className="btn btn--primary" onClick={() => window.location.reload()}>
            {t("Retry")}
          </button>
        </div>
      );
    }

    if (services.length === 0) {
      return (
        <div className="service-library__state">
          <h3>{t("No services yet")}</h3>
          <p>{t("Add your first service to start building your catalog.")}</p>
          <button className="btn btn--primary" onClick={openCreateModal}>
            {t("Create your first service")}
          </button>
        </div>
      );
    }

    if (filteredServices.length === 0) {
      return (
        <div className="service-library__state">
          <h3>{t("No services match your filters")}</h3>
          <p>{t("Try adjusting your search or status filter.")}</p>
        </div>
      );
    }

    return (
      <div className="service-library__table-wrapper">
        <table className="service-library__table">
          <thead>
            <tr>
              <th>{t("Name")}</th>
              <th>{t("Category")}</th>
              <th>{t("Default duration")}</th>
              <th>{t("Default price")}</th>
              <th>{t("Status")}</th>
              <th className="service-library__actions-col">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.map((service) => (
              <tr key={service.id}>
                <td>
                  <div className="service-library__cell-title">{service.name}</div>
                  <div className="service-library__cell-subtext">{service.description}</div>
                  {service.offeredByCount !== undefined && (
                    <div className="service-library__cell-footnote">
                      {service.offeredByCount} {t("team")}{" "}
                      {service.offeredByCount === 1 ? t("member") : t("members")} {t("offer this service")}
                    </div>
                  )}
                </td>
                <td>{service.category || "—"}</td>
                <td>
                  {service.duration} {t("min")}
                </td>
                <td>{service.price !== undefined ? `$${service.price}` : "—"}</td>
                <td>{renderStatusPill(toStatusLabel(service))}</td>
                <td className="service-library__actions">
                  <button className="btn btn--ghost" onClick={() => openEditModal(service)}>
                    {t("Edit")}
                  </button>
                  <button className="btn btn--ghost service-library__archive" onClick={() => handleArchiveRequest(service)}>
                    {t("Archive")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="service-library">
      <div className="service-library__inner">
        <header className="service-library__header">
          <div>
            <h1>{t("Services")}</h1>
            <p className="service-library__subtitle">
              {t("Manage your catalog. Team assignments are configured elsewhere.")}
            </p>
          </div>
          <button className="btn btn--primary" onClick={openCreateModal}>
            {t("+ New service")}
          </button>
        </header>

        <div className="service-library__filters">
          <div className="service-library__search">
            <input
              type="search"
              placeholder={t("Search by service name")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="service-library__chips">
            {["All", "Active", "Archived"].map((status) => (
              <button
                key={status}
                className={`service-library__chip ${statusFilter === status ? "service-library__chip--active" : ""}`}
                onClick={() => setStatusFilter(status as "All" | ServiceStatus)}
              >
                {t(status)}
              </button>
            ))}
          </div>
        </div>

        <section className="service-library__panel">{renderTable()}</section>
      </div>

      {isModalOpen && (
        <div className="service-library__overlay" role="dialog" aria-modal="true">
          <div className="service-library__modal">
            <div className="service-library__modal-header">
              <div>
                <p className="service-library__eyebrow">
                  {editingService ? t("Edit service") : t("New service")}
                </p>
                <h2>{editingService ? editingService.name : t("Create service")}</h2>
              </div>
              <button className="service-library__close" onClick={closeModals} aria-label={t("Close")}>
                ×
              </button>
            </div>

            <form className="service-library__form" onSubmit={handleSave}>
              <label>
                <span>{t("Name")} *</span>
                <input
                  required
                  type="text"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder={t("Service name")}
                />
              </label>

              <label>
                <span>{t("Description")}</span>
                <textarea
                  rows={3}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder={t("What is included")}
                />
              </label>

              <label>
                <span>{t("Category")}</span>
                <input
                  type="text"
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  placeholder={t("e.g. Advisory")}
                />
              </label>

              <div className="service-library__grid">
                <label>
                  <span>{t("Default duration (minutes)")}</span>
                  <input
                    type="number"
                    min={0}
                    value={formState.duration}
                    onChange={(e) => setFormState({ ...formState, duration: Number(e.target.value) || 0 })}
                  />
                </label>

                <label>
                  <span>{t("Default price (USD)")}</span>
                  <input
                    type="number"
                    min={0}
                    value={formState.price ?? ""}
                    onChange={(e) =>
                      setFormState({ ...formState, price: e.target.value ? Number(e.target.value) : undefined })
                    }
                    placeholder={t("Optional")}
                  />
                </label>
              </div>

              <div className="service-library__inline">
                <label className="service-library__toggle">
                  <input
                    type="checkbox"
                    checked={formState.active}
                    onChange={(e) => setFormState({ ...formState, active: e.target.checked })}
                  />
                  <span>{formState.active ? t("Active") : t("Archived")}</span>
                </label>
              </div>

              <div className="service-library__actions-row">
                <button type="button" className="btn btn--ghost" onClick={closeModals}>
                  {t("Cancel")}
                </button>
                <button type="submit" className="btn btn--primary" disabled={isSaving}>
                  {isSaving ? t("Saving…") : t("Save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {archiveTarget && (
        <div className="service-library__overlay" role="alertdialog" aria-modal="true">
          <div className="service-library__confirm">
            <h3>{t("Archive this service?")}</h3>
            <p>
              {t("Archive will move")} {archiveTarget.name} {t("to Archived. You can reactivate it later from this list. Team assignments stay unchanged.")}
            </p>
            <div className="service-library__actions-row">
              <button className="btn btn--ghost" onClick={() => setArchiveTarget(null)} disabled={isArchiving}>
                {t("Cancel")}
              </button>
              <button className="btn btn--danger" onClick={confirmArchive} disabled={isArchiving}>
                {isArchiving ? t("Archiving…") : t("Archive")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceLibrary;
