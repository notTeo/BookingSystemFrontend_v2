import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getActiveShopId, setActiveShopId } from "../../../../api/http";
import { deleteShop, updateShop } from "../../../../api/shop";
import { useShop } from "../../../../providers/ShopProvider";
import type { OpeningHour } from "../../../../types/shop";

import "./EditShop.css";

type DaySchedule = {
  dayOfWeek: OpeningHour["dayOfWeek"];
  isClosed: boolean;
  blocks: Array<{ openTime: string; closeTime: string }>;
};

type FormState = {
  name: string;
  address: string;
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

  const hours = useMemo(
    () => currentShop?.workingHours ?? currentShop?.shop?.workingHours ?? [],
    [currentShop],
  );

  const [form, setForm] = useState<FormState>(() => ({
    name: "",
    address: "",
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
      setError("Please provide a shop name before saving.");
      return;
    }

    setStatus("pending");
    setError(null);

    try {
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
        active: form.active,
        openingHours,
      });

      await refreshShop();
      setStatus("success");
      navigate(`/shops/${encodeURIComponent(form.name.trim())}`);
    } catch (err) {
      console.error("Update shop failed", err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to update shop. Please try again.");
    }
  };

  const handleDeleteShop = async () => {
    if (!currentShop) return;

    const confirmed = window.confirm(
      `This will permanently delete ${currentShop.shop.name ?? "this shop"}. Continue?`,
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
        err instanceof Error ? err.message : "Unable to delete shop. Please try again.",
      );
      setDeleteStatus("error");
    }
  };

  if (!shopId) return <p className="edit-shop__empty">Select a shop to edit its details.</p>;
  if (isLoading && !currentShop)
    return <p className="edit-shop__loading">Loading shop details...</p>;
  if (!currentShop) return <p className="edit-shop__error">Shop details not available.</p>;


  console.log(currentShop)
  return (
    <div className="edit-shop">
      <header className="edit-shop__header">
        <div>
          <h1 className="edit-shop__title">Edit shop</h1>
          <p className="edit-shop__subtitle">
            Update your shop information and set the weekly working hours.
          </p>
        </div>
      </header>

      <form className="edit-shop__form" onSubmit={handleSubmit}>
        <section className="edit-shop__card">
          <div className="edit-shop__card-header">
            <div>
              <h2>Shop details</h2>
              <p>Adjust the information customers will see when they book.</p>
            </div>
            {status === "success" && <span className="edit-shop__pill">Saved</span>}
          </div>

          <div className="edit-shop__grid">
            <label className="edit-shop__field">
              <span>Shop name</span>
              <input
                className="edit-shop__input"
                type="text"
                name="name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Downtown Cuts"
              />
            </label>

            <label className="edit-shop__field">
              <span>Address</span>
              <input
                className="edit-shop__input"
                type="text"
                name="address"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="123 Main St, Springfield"
              />
            </label>

            <label className="edit-shop__field edit-shop__field--toggle">
              <span>Status</span>

              <div className="edit-shop__toggle">
                <input
                  id="shop-active"
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => updateField("active", e.target.checked)}
                />
                <span className="edit-shop__toggleText">{form.active ? "Active" : "Inactive"}</span>
              </div>

              <small className="edit-shop__hint">Inactive shops won’t appear for booking.</small>
            </label>
          </div>
        </section>

        <section className="edit-shop__card">
          {/* Clickable header to collapse the card body */}
          <button
            type="button"
            className="edit-shop__card-header edit-shop__card-header--clickable"
            onClick={toggleHoursCollapsed}
            aria-expanded={!hoursCollapsed}
            aria-controls="working-hours-body"
          >
            <div>
              <h2>Working hours</h2>
              <p>Control when customers can book and mark closed days.</p>
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
                      <span>Closed</span>
                    </label>
                  </div>

                  <div className="edit-shop__blocks">
                    {schedule.isClosed ? (
                      <div className="edit-shop__closed-note">Day marked as closed.</div>
                    ) : (
                      schedule.blocks.map((block, index) => (
                        <div key={`${day}-${index}`} className="edit-shop__time-block">
                          <div className="edit-shop__time">
                            <label>
                              <span>Opens</span>
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
                              <span>Closes</span>
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
                              aria-label={`Remove block ${index + 1} for ${day}`}
                            >
                              Remove
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
                        + Add time block
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {error && <div className="edit-shop__alert edit-shop__alert--error">{error}</div>}
        {status === "success" && (
          <div className="edit-shop__alert edit-shop__alert--success">Changes saved.</div>
        )}

        <div className="edit-shop__actions">
          <button type="button" className="edit-shop__ghost" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="edit-shop__primary" disabled={isSubmitDisabled}>
            {status === "pending" ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
      <section className="edit-shop__card edit-shop__danger" aria-labelledby="delete-shop">
        <div className="edit-shop__card-header">
          <div>
            <p className="edit-shop__eyebrow">Danger zone</p>
            <h2 id="delete-shop">Delete shop</h2>
            <p>
              Removing this shop will delete its settings and availability for all team members.
              This action cannot be undone.
            </p>
          </div>
        </div>

        {deleteError && (
          <div className="edit-shop__alert edit-shop__alert--error">{deleteError}</div>
        )}
        {deleteStatus === "success" && (
          <div className="edit-shop__alert edit-shop__alert--success">
            Shop deleted. Redirecting to shops…
          </div>
        )}

        <div className="edit-shop__dangerActions">
          <button
            type="button"
            className="edit-shop__dangerBtn"
            onClick={handleDeleteShop}
            disabled={deleteStatus === "pending"}
          >
            {deleteStatus === "pending" ? "Deleting…" : "Delete shop"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default EditShop;
