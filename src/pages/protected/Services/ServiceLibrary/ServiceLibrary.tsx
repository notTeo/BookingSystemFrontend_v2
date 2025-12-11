import React, { useEffect, useMemo, useState } from "react";
import "./ServiceLibrary.css";

type ServiceStatus = "Active" | "Archived";

type Service = {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultDurationMinutes: number;
  defaultPrice?: number;
  status: ServiceStatus;
  offeredByCount?: number;
};

const mockServices: Service[] = [
  {
    id: "svc-001",
    name: "Consultation",
    description: "30-minute discovery session to understand client needs.",
    category: "Advisory",
    defaultDurationMinutes: 30,
    defaultPrice: 75,
    status: "Active",
    offeredByCount: 3,
  },
  {
    id: "svc-002",
    name: "Implementation Workshop",
    description: "Hands-on configuration and training for the client team.",
    category: "Professional Services",
    defaultDurationMinutes: 90,
    defaultPrice: 240,
    status: "Active",
    offeredByCount: 5,
  },
  {
    id: "svc-003",
    name: "Premium Support",
    description: "Dedicated support channel with 2-hour response time.",
    category: "Support",
    defaultDurationMinutes: 60,
    status: "Archived",
    offeredByCount: 2,
  },
];

const defaultFormState: Service = {
  id: "",
  name: "",
  description: "",
  category: "",
  defaultDurationMinutes: 30,
  defaultPrice: undefined,
  status: "Active",
  offeredByCount: 0,
};

const ServiceLibrary: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | ServiceStatus>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formState, setFormState] = useState<Service>(defaultFormState);
  const [archiveTarget, setArchiveTarget] = useState<Service | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        // Simulate loading
        await new Promise((resolve) => setTimeout(resolve, 450));
        setServices(mockServices);
      } catch (err) {
        setError("Unable to load services. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" ? true : service.status.toLowerCase() === statusFilter.toLowerCase();

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

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setFormState({ ...service });
    setIsModalOpen(true);
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.name.trim()) {
      return;
    }

    if (editingService) {
      setServices((prev) =>
        prev.map((svc) => (svc.id === editingService.id ? { ...formState } : svc)),
      );
    } else {
      const newService: Service = {
        ...formState,
        id: crypto.randomUUID(),
        offeredByCount: formState.offeredByCount ?? 0,
      };
      setServices((prev) => [newService, ...prev]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleArchiveRequest = (service: Service) => {
    setArchiveTarget(service);
  };

  const confirmArchive = () => {
    if (!archiveTarget) return;

    setServices((prev) =>
      prev.map((svc) => (svc.id === archiveTarget.id ? { ...svc, status: "Archived" } : svc)),
    );
    setArchiveTarget(null);
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setArchiveTarget(null);
    resetForm();
  };

  const renderStatusPill = (status: ServiceStatus) => (
    <span
      className={`service-library__status-pill service-library__status-pill--${status.toLowerCase()}`}
    >
      {status}
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
            Retry
          </button>
        </div>
      );
    }

    if (services.length === 0) {
      return (
        <div className="service-library__state">
          <h3>No services yet</h3>
          <p>Add your first service to start building your catalog.</p>
          <button className="btn btn--primary" onClick={openCreateModal}>
            Create your first service
          </button>
        </div>
      );
    }

    if (filteredServices.length === 0) {
      return (
        <div className="service-library__state">
          <h3>No services match your filters</h3>
          <p>Try adjusting your search or status filter.</p>
        </div>
      );
    }

    return (
      <div className="service-library__table-wrapper">
        <table className="service-library__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Default duration</th>
              <th>Default price</th>
              <th>Status</th>
              <th className="service-library__actions-col">Actions</th>
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
                      {service.offeredByCount} team{" "}
                      {service.offeredByCount === 1 ? "member" : "members"} offer this service
                    </div>
                  )}
                </td>
                <td>{service.category || "—"}</td>
                <td>{service.defaultDurationMinutes} min</td>
                <td>{service.defaultPrice !== undefined ? `$${service.defaultPrice}` : "—"}</td>
                <td>{renderStatusPill(service.status)}</td>
                <td className="service-library__actions">
                  <button className="btn btn--ghost" onClick={() => openEditModal(service)}>
                    Edit
                  </button>
                  <button
                    className="btn btn--ghost service-library__archive"
                    onClick={() => handleArchiveRequest(service)}
                  >
                    Archive
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
            <p className="service-library__eyebrow">Services management</p>
            <h1>Services</h1>
            <p className="service-library__subtitle">
              Manage your catalog. Team assignments are configured elsewhere.
            </p>
          </div>
          <button className="btn btn--primary" onClick={openCreateModal}>
            + New service
          </button>
        </header>

        <div className="service-library__filters">
          <div className="service-library__search">
            <input
              type="search"
              placeholder="Search by service name"
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
                {status}
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
                  {editingService ? "Edit service" : "New service"}
                </p>
                <h2>{editingService ? editingService.name : "Create service"}</h2>
              </div>
              <button className="service-library__close" onClick={closeModals} aria-label="Close">
                ×
              </button>
            </div>

            <form className="service-library__form" onSubmit={handleSave}>
              <label>
                <span>Name *</span>
                <input
                  required
                  type="text"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="Service name"
                />
              </label>

              <label>
                <span>Description</span>
                <textarea
                  rows={3}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="What is included"
                />
              </label>

              <label>
                <span>Category</span>
                <input
                  type="text"
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  placeholder="e.g. Advisory"
                />
              </label>

              <div className="service-library__grid">
                <label>
                  <span>Default duration (minutes)</span>
                  <input
                    type="number"
                    min={0}
                    value={formState.defaultDurationMinutes}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        defaultDurationMinutes: Number(e.target.value) || 0,
                      })
                    }
                  />
                </label>

                <label>
                  <span>Default price (USD)</span>
                  <input
                    type="number"
                    min={0}
                    value={formState.defaultPrice ?? ""}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        defaultPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="Optional"
                  />
                </label>
              </div>

              <div className="service-library__inline">
                <label className="service-library__toggle">
                  <input
                    type="checkbox"
                    checked={formState.status === "Active"}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        status: e.target.checked ? "Active" : "Archived",
                      })
                    }
                  />
                  <span>{formState.status === "Active" ? "Active" : "Archived"}</span>
                </label>
              </div>

              <div className="service-library__actions-row">
                <button type="button" className="btn btn--ghost" onClick={closeModals}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {archiveTarget && (
        <div className="service-library__overlay" role="alertdialog" aria-modal="true">
          <div className="service-library__confirm">
            <h3>Archive this service?</h3>
            <p>
              {archiveTarget.name} will move to Archived. You can reactivate it later from this
              list. Team assignments stay unchanged.
            </p>
            <div className="service-library__actions-row">
              <button className="btn btn--ghost" onClick={() => setArchiveTarget(null)}>
                Cancel
              </button>
              <button className="btn btn--danger" onClick={confirmArchive}>
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceLibrary;
