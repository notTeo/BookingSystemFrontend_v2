import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getActiveShopId, setActiveShopId } from "../../../../api/http";
import { deleteShop, updateShop } from "../../../../api/shop";
import { useShop } from "../../../../providers/ShopProvider";
import type { OpeningHour } from "../../../../types/shop";
import { useI18n } from "../../../../i18n";

import "./EditShop.css";

type DaySchedule = {
  dayOfWeek: OpeningHour["dayOfWeek"];
  isClosed: boolean;
  blocks: Array<{ openTime: string; closeTime: string }>;
};

type FormState = {
  name: string;
  address: string;
  websiteUrl: string;
  showDirectionsLink: boolean;
  includeCalendarLink: boolean;
  active: boolean;
  workingHours: DaySchedule[];
};

const DAYS: OpeningHour["dayOfWeek"][] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const FALLBACK_BLOCKS = [{ openTime: "09:00", closeTime: "17:00" }];

function buildDaySchedules(hours?: OpeningHour[]): DaySchedule[] {
  return DAYS.map((day) => {
    const hoursForDay = (hours ?? []).filter((h) => h.dayOfWeek === day);

    const isClosed = hoursForDay.some((h) => h.isClosed === true);

    const blocks = hoursForDay
      .filter((h) => !h.isClosed)
      .map((h) => ({ openTime: h.openTime, closeTime: h.closeTime }));

    return {
      dayOfWeek: day,
      isClosed,
      blocks: isClosed ? FALLBACK_BLOCKS : blocks.length ? blocks : FALLBACK_BLOCKS,
    };
  });
}

const EditShop: React.FC = () => {
  const { currentShop, isLoading, refreshShop, setCurrentShop } = useShop();
  const navigate = useNavigate();
  const shopId = getActiveShopId();
  const { t } = useI18n();

  const hours = useMemo(
    () => currentShop?.workingHours ?? currentShop?.shop?.workingHours ?? [],
    [currentShop],
  );

  const [form, setForm] = useState<FormState>(() => ({
    name: "",
    address: "",
    websiteUrl: "",
    showDirectionsLink: true,
    includeCalendarLink: false,
    active: true,
    workingHours: buildDaySchedules(hours),
  }));

  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<
  "idle" | "pending" | "success" | "error"
>("idle");
const [deleteError, setDeleteError] = useState<string | null>(null);

  // Collapse the whole Working Hours card body
  const [hoursCollapsed, setHoursCollapsed] = useState(false);
  const toggleHoursCollapsed = () => setHoursCollapsed((p) => !p);

  useEffect(() => {
    if (!shopId) return;
    refreshShop();
  }, [shopId, refreshShop]);

  useEffect(() => {
    if (!currentShop) return;

    setForm({
      name: currentShop.shop.name ?? "",
      address: currentShop.shop.address ?? "",
      websiteUrl: currentShop.shop.websiteUrl ?? "",
      showDirectionsLink: currentShop.shop.showDirectionsLink ?? false,
      includeCalendarLink: currentShop.shop.includeCalendarLink ?? false,
      active: currentShop.shop.active ?? true,
      workingHours: buildDaySchedules(hours),
    });
  }, [currentShop, hours]);

  const isSubmitDisabled = useMemo(
    () => status === "pending" || !form.name.trim(),
    [status, form.name],
  );

  const resetStatusError = () => {
    if (status !== "idle") setStatus("idle");
    if (error) setError(null);
  };

  const updateField = (key: keyof FormState, value: string | DaySchedule[] | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }) as FormState);
    resetStatusError();
  };

  const updateBlock = (
    day: OpeningHour["dayOfWeek"],
    index: number,
    changes: Partial<{ openTime: string; closeTime: string }>,
  ) => {
    setForm((prev) => ({
      ...prev,
      workingHours: prev.workingHours.map((schedule) => {
        if (schedule.dayOfWeek !== day) return schedule;

        return {
          ...schedule,
          blocks: schedule.blocks.map((block, idx) =>
            idx === index ? { ...block, ...changes } : block,
          ),
        };
      }),
    }));
    resetStatusError();
  };

  const toggleClosed = (day: OpeningHour["dayOfWeek"], value: boolean) => {
    setForm((prev) => ({
      ...prev,
      workingHours: prev.workingHours.map((schedule) => {
        if (schedule.dayOfWeek !== day) return schedule;
        return { ...schedule, isClosed: value };
      }),
    }));
    resetStatusError();
  };

  const addBlock = (day: OpeningHour["dayOfWeek"]) => {
    setForm((prev) => ({
      ...prev,
      workingHours: prev.workingHours.map((schedule) => {
        if (schedule.dayOfWeek !== day) return schedule;

        const lastBlock = schedule.blocks[schedule.blocks.length - 1];
        const start = lastBlock ? lastBlock.closeTime : "09:00";
        const end = lastBlock ? lastBlock.closeTime : "17:00";

        return {
          ...schedule,
          isClosed: false,
          blocks: [...schedule.blocks, { openTime: start, closeTime: end }],
        };
      }),
    }));
    resetStatusError();
  };

  const removeBlock = (day: OpeningHour["dayOfWeek"], index: number) => {
    setForm((prev) => ({
      ...prev,
      workingHours: prev.workingHours.map((schedule) => {
        if (schedule.dayOfWeek !== day) return schedule;
        if (schedule.blocks.length <= 1) return schedule;

        return {
          ...schedule,
          blocks: schedule.blocks.filter((_, idx) => idx !== index),
        };
      }),
    }));
    resetStatusError();
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setStatus("error");
      setError(t("Please provide a shop name before saving."));
      return;
    }
    setStatus("pending");
    setError(null);

    try {
      const normalizeUrl = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return "";
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        return `https://${trimmed}`;
      };

      const openingHours = form.workingHours.flatMap((schedule) => {
        if (schedule.isClosed) {
          return [
            {
              dayOfWeek: schedule.dayOfWeek,
              openTime: "00:00",
              closeTime: "00:00",
              isClosed: true,
            },
          ];
        }

        return schedule.blocks.map((block) => ({
          dayOfWeek: schedule.dayOfWeek,
          openTime: block.openTime,
          closeTime: block.closeTime,
          isClosed: false,
        }));
      });

      await updateShop({
        name: form.name.trim(),
        address: form.address.trim() || null,
        websiteUrl: form.websiteUrl.trim() ? normalizeUrl(form.websiteUrl) : null,
        showDirectionsLink: form.showDirectionsLink,
        includeCalendarLink: form.includeCalendarLink,
        active: form.active,
        openingHours,
      });

      await refreshShop();
      setStatus("success");
      navigate(`/shops/${encodeURIComponent(form.name.trim())}`);
    } catch (err) {
      console.error("Update shop failed", err);
      setStatus("error");
      setError(
        err instanceof Error ? err.message : t("Unable to update shop. Please try again."),
      );
    }
  };

  const handleDeleteShop = async () => {
    if (!currentShop) return;

    const confirmed = window.confirm(
      t("This will permanently delete") +
        ` ${currentShop.shop.name ?? t("this shop")}. ` +
        t("Continue?"),
    );

    if (!confirmed) return;

    setDeleteStatus("pending");
    setDeleteError(null);

    try {
      await deleteShop();
      setDeleteStatus("success");
      setActiveShopId(null);
      setCurrentShop(null);
      navigate("/shops");
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : t("Unable to delete shop. Please try again."),
      );
      setDeleteStatus("error");
    }
  };

  if (!shopId) return <p className="edit-shop__empty">{t("Select a shop to edit its details.")}</p>;
  if (isLoading && !currentShop)
    return <p className="edit-shop__loading">{t("Loading shop details...")}</p>;
  if (!currentShop) return <p className="edit-shop__error">{t("Shop details not available.")}</p>;


  return (
    <div className="edit-shop">
      <header className="edit-shop__header">
        <div>
          <h1 className="edit-shop__title">{t("Edit shop")}</h1>
          <p className="edit-shop__subtitle">
            {t("Update your shop information and set the weekly working hours.")}
          </p>
        </div>
        <div className="edit-shop__headerActions">
          <button
            type="button"
            className="edit-shop__ghost"
            onClick={() => navigate(-1)}
            form="edit-shop-form"
          >
            {t("Cancel")}
          </button>
          <button
            type="submit"
            className="edit-shop__primary"
            form="edit-shop-form"
            disabled={isSubmitDisabled}
          >
            {status === "pending" ? t("Saving...") : t("Save changes")}
          </button>
        </div>
      </header>

      <form className="edit-shop__form" id="edit-shop-form" onSubmit={handleSubmit}>
        <div className="edit-shop__layout">
          <div className="edit-shop__column">
            <section className="edit-shop__card">
              <div className="edit-shop__card-header">
                <div>
                  <h2>{t("Shop details")}</h2>
                  <p>{t("Adjust the information customers will see when they book.")}</p>
                </div>
                {status === "success" && <span className="edit-shop__pill">{t("Saved")}</span>}
              </div>

              <div className="edit-shop__grid">
                <label className="edit-shop__field">
                  <span>{t("Shop name")}</span>
                  <input
                    className="edit-shop__input"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder={t("Downtown Cuts")}
                  />
                </label>

                <label className="edit-shop__field">
                  <span>{t("Address")}</span>
                  <input
                    className="edit-shop__input"
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder={t("123 Main St, Springfield")}
                  />
                </label>

                <label className="edit-shop__field">
                  <span>{t("Booking URL")}</span>
                  <div className="edit-shop__input edit-shop__input--readonly">
                    {currentShop.shop.bookingEndpoint ?? t("Unavailable")}
                  </div>
                </label>

                <label className="edit-shop__field">
                  <span>{t("Website URL")}</span>
                  <input
                    className="edit-shop__input"
                    type="url"
                    name="websiteUrl"
                    value={form.websiteUrl}
                    onChange={(e) => updateField("websiteUrl", e.target.value)}
                    placeholder={t("https://yourshop.com")}
                  />
                </label>
              </div>
            </section>

            <section className="edit-shop__card edit-shop__card--narrow">
              {/* Clickable header to collapse the card body */}
              <button
                type="button"
                className="edit-shop__card-header edit-shop__card-header--clickable"
                onClick={toggleHoursCollapsed}
                aria-expanded={!hoursCollapsed}
                aria-controls="working-hours-body"
              >
                <div>
                  <h2>{t("Working hours")}</h2>
                  <p>{t("Control when customers can book and mark closed days.")}</p>
                </div>

                <h1 className="edit-shop__hours-caret" aria-hidden="true">
                  {hoursCollapsed ? "▾" : "▴"}
                </h1>
              </button>

              <div
                id="working-hours-body"
                className={`edit-shop__hours ${hoursCollapsed ? "is-collapsed" : ""}`}
              >
                {DAYS.map((day) => {
                  const schedule = form.workingHours.find((h) => h.dayOfWeek === day)!;

                  return (
                    <div key={day} className="edit-shop__hours-row">
                      <div className="edit-shop__day-header">
                        <div className="edit-shop__day">{day.slice(0, 3)}</div>

                        <label className="edit-shop__closed">
                          <input
                            type="checkbox"
                            checked={schedule.isClosed}
                            onChange={(e) => toggleClosed(day, e.target.checked)}
                          />
                          <span>{t("Closed")}</span>
                        </label>
                      </div>

                      <div className="edit-shop__blocks">
                        {schedule.isClosed ? (
                          <div className="edit-shop__closed-note">{t("Day marked as closed.")}</div>
                        ) : (
                          schedule.blocks.map((block, index) => (
                            <div key={`${day}-${index}`} className="edit-shop__time-block">
                              <div className="edit-shop__time">
                                <label>
                                  <span>{t("Opens")}</span>
                                  <input
                                    className="edit-shop__time-input"
                                    type="time"
                                    value={block.openTime}
                                    disabled={schedule.isClosed}
                                    onChange={(e) =>
                                      updateBlock(day, index, { openTime: e.target.value })
                                    }
                                  />
                                </label>
                                <label>
                                  <span>{t("Closes")}</span>
                                  <input
                                    className="edit-shop__time-input"
                                    type="time"
                                    value={block.closeTime}
                                    disabled={schedule.isClosed}
                                    onChange={(e) =>
                                      updateBlock(day, index, { closeTime: e.target.value })
                                    }
                                  />
                                </label>
                              </div>

                              {schedule.blocks.length > 1 && (
                                <button
                                  type="button"
                                  className="edit-shop__icon-btn"
                                  onClick={() => removeBlock(day, index)}
                                  aria-label={`${t("Remove block")} ${index + 1} ${t("for")} ${day}`}
                                >
                                  {t("Remove")}
                                </button>
                              )}
                            </div>
                          ))
                        )}

                        {!schedule.isClosed && (
                          <button
                            type="button"
                            className="edit-shop__add-block"
                            onClick={() => addBlock(day)}
                          >
                            {t("+ Add time block")}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="edit-shop__column">
            <section className="edit-shop__card edit-shop__card--compact">
              <div className="edit-shop__card-header">
                <div>
                  <h2>{t("Booking options")}</h2>
                  <p>{t("Control booking links and shop visibility.")}</p>
                </div>
              </div>

              <div className="edit-shop__toggleGrid">
                <label className="edit-shop__field edit-shop__field--toggle">
                  <span>{t("Directions link")}</span>

                  <div className="edit-shop__toggle">
                    <input
                      id="shop-directions"
                      type="checkbox"
                      checked={form.showDirectionsLink}
                      onChange={(e) => updateField("showDirectionsLink", e.target.checked)}
                    />
                    <span className="edit-shop__toggleText">
                      {form.showDirectionsLink ? t("Shown") : t("Hidden")}
                    </span>
                  </div>

                  <small className="edit-shop__hint">
                    {t("Adds a Google Maps link to booking confirmations.")}
                  </small>
                </label>

                <label className="edit-shop__field edit-shop__field--toggle">
                  <span>{t("Calendar link")}</span>

                  <div className="edit-shop__toggle">
                    <input
                      id="shop-calendar"
                      type="checkbox"
                      checked={form.includeCalendarLink}
                      onChange={(e) => updateField("includeCalendarLink", e.target.checked)}
                    />
                    <span className="edit-shop__toggleText">
                      {form.includeCalendarLink ? t("Enabled") : t("Disabled")}
                    </span>
                  </div>

                  <small className="edit-shop__hint">
                    {t("Adds a Google Calendar link for customers.")}
                  </small>
                </label>

                <label className="edit-shop__field edit-shop__field--toggle">
                  <span>{t("Status")}</span>

                  <div className="edit-shop__toggle">
                    <input
                      id="shop-active"
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => updateField("active", e.target.checked)}
                    />
                    <span className="edit-shop__toggleText">
                      {form.active ? t("Active") : t("Inactive")}
                    </span>
                  </div>

                  <small className="edit-shop__hint">
                    {t("Inactive shops won’t appear for booking.")}
                  </small>
                </label>
              </div>
            </section>

            {error && <div className="edit-shop__alert edit-shop__alert--error">{error}</div>}
            {status === "success" && (
              <div className="edit-shop__alert edit-shop__alert--success">{t("Changes saved.")}</div>
            )}

          </div>
        </div>
      </form>
      <section className="edit-shop__card edit-shop__danger" aria-labelledby="delete-shop">
        <div className="edit-shop__card-header">
          <div>
            <p className="edit-shop__eyebrow">{t("Danger zone")}</p>
            <h2 id="delete-shop">{t("Delete shop")}</h2>
            <p>
              {t("Removing this shop will delete its settings and availability for all team members. This action cannot be undone.")}
            </p>
          </div>
        </div>

        {deleteError && (
          <div className="edit-shop__alert edit-shop__alert--error">{deleteError}</div>
        )}
        {deleteStatus === "success" && (
          <div className="edit-shop__alert edit-shop__alert--success">
            {t("Shop deleted. Redirecting to shops…")}
          </div>
        )}

        <div className="edit-shop__dangerActions">
          <button
            type="button"
            className="edit-shop__dangerBtn"
            onClick={handleDeleteShop}
            disabled={deleteStatus === "pending"}
          >
            {deleteStatus === "pending" ? t("Deleting…") : t("Delete shop")}
          </button>
        </div>
      </section>
    </div>
  );
};

export default EditShop;
