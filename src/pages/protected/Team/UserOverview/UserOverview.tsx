import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import {
  getMemberHours,
  getTeamOverview,
  replaceMemberHours,
  toggleMemberBookable,
  toggleMemberStatus,
  updateMemberRole,
} from "../../../../api/team";
import type { DayOfWeek } from "../../../../types/common";
import type { TeamMemberSummary, WeekSchedule } from "../../../../types/team";
import "./UserOverview.css";

const DAY_LABELS: { key: DayOfWeek; label: string }[] = [
  { key: "MONDAY", label: "Monday" },
  { key: "TUESDAY", label: "Tuesday" },
  { key: "WEDNESDAY", label: "Wednesday" },
  { key: "THURSDAY", label: "Thursday" },
  { key: "FRIDAY", label: "Friday" },
  { key: "SATURDAY", label: "Saturday" },
  { key: "SUNDAY", label: "Sunday" },
];

const ROLE_OPTIONS = [
  { value: "OWNER", label: "Owner" },
  { value: "MANAGER", label: "Manager" },
  { value: "STAFF", label: "Staff" },
];

const DEFAULT_SLOT = { start: "09:00", end: "17:00" } as const;

function buildEmptyWeek(): WeekSchedule[] {
  return DAY_LABELS.map((day) => ({
    dayOfWeek: day.key,
    isOff: true,
    slots: [],
  }));
}

function normalizeWeek(week?: WeekSchedule[] | null) {
  const empty = buildEmptyWeek();
  if (!week || week.length === 0) return empty;

  return empty.map((day) => {
    const match = week.find((item) => item.dayOfWeek === day.dayOfWeek);

    if (!match) return day;

    return {
      dayOfWeek: match.dayOfWeek,
      isOff: Boolean(match.isOff),
      slots: match.slots?.length ? match.slots.map((slot) => ({ ...slot })) : [],
    };
  });
}

const UserOverview: React.FC = () => {
  const { teamName, shopName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const memberFromState = useMemo(
    () => (location.state as { member?: TeamMemberSummary } | undefined)?.member,
    [location.state],
  );

  const [member, setMember] = useState<TeamMemberSummary | null>(memberFromState ?? null);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [memberNotice, setMemberNotice] = useState<string | null>(null);

  const [week, setWeek] = useState<WeekSchedule[]>(buildEmptyWeek());
  const [hoursLoading, setHoursLoading] = useState(false);
  const [hoursError, setHoursError] = useState<string | null>(null);
  const [hoursStatus, setHoursStatus] = useState<"idle" | "saving" | "saved">("idle");
  const memberId = useMemo(() => {
    const fromRoute = Number(teamName);
    if (!Number.isNaN(fromRoute)) return fromRoute;
    if (member) return member?.id;
    return null;
  }, [member, teamName]);

  const backToTeamHref = shopName ? `/shops/${encodeURIComponent(shopName)}/team` : "/shops";

  const loadMemberFromApi = useCallback(async () => {
    if (member || !memberId) return;

    setMemberLoading(true);
    setMemberError(null);

    try {
      const overview = await getTeamOverview();
      const found = overview.members.find(
        (item) => item.shopUserId === memberId || item.id === memberId,
      );

      if (!found) {
        setMemberError("Member not found for this shop.");
        return;
      }

      setMember(found);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load member.";
      setMemberError(message);
    } finally {
      setMemberLoading(false);
    }
  }, [member, memberId]);

  const loadHours = useCallback(async () => {
    if (!member) return;

    setHoursLoading(true);
    setHoursError(null);

    try {
      const data = await getMemberHours(member.id);
      setWeek(normalizeWeek(data));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load working hours.";
      setHoursError(message);
      setWeek(buildEmptyWeek());
    } finally {
      setHoursLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    loadMemberFromApi();
  }, [loadMemberFromApi]);

  useEffect(() => {
    loadHours();
  }, [loadHours]);

  const updateSlot = (day: DayOfWeek, index: number, field: "start" | "end", value: string) => {
    setHoursStatus("idle");
    setWeek((prev) =>
      prev.map((schedule) => {
        if (schedule.dayOfWeek !== day) return schedule;
        const nextSlots = schedule.slots.map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot,
        );
        return { ...schedule, slots: nextSlots };
      }),
    );
  };

  const addSlot = (day: DayOfWeek) => {
    setHoursStatus("idle");
    setWeek((prev) =>
      prev.map((schedule) => {
        if (schedule.dayOfWeek !== day) return schedule;
        return {
          ...schedule,
          isOff: false,
          slots: [...schedule.slots, { ...DEFAULT_SLOT }],
        };
      }),
    );
  };

  const removeSlot = (day: DayOfWeek, index: number) => {
    setHoursStatus("idle");
    setWeek((prev) =>
      prev.map((schedule) => {
        if (schedule.dayOfWeek !== day) return schedule;
        const nextSlots = schedule.slots.filter((_, i) => i !== index);
        return { ...schedule, slots: nextSlots };
      }),
    );
  };

  const toggleDayOff = (day: DayOfWeek, isOff: boolean) => {
    setHoursStatus("idle");
    setWeek((prev) =>
      prev.map((schedule) => {
        if (schedule.dayOfWeek !== day) return schedule;

        if (isOff) {
          return { ...schedule, isOff: true, slots: [] };
        }

        const nextSlots = schedule.slots.length ? schedule.slots : [{ ...DEFAULT_SLOT }];
        return { ...schedule, isOff: false, slots: nextSlots };
      }),
    );
  };

  const handleSaveHours = async () => {
    if (!member) return;

    setHoursStatus("saving");
    setHoursError(null);

    try {
      await replaceMemberHours(member.id, week);
      setHoursStatus("saved");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update hours.";
      setHoursError(message);
      setHoursStatus("idle");
    }
  };

  const handleToggleActive = async () => {
    if (!member) return;

    setMemberNotice(null);
    setMemberError(null);

    try {
      const result = await toggleMemberStatus(member.id);
      setMember((prev) => (prev ? { ...prev, active: result.updated.active } : prev));
      setMemberNotice(result.updated.active ? "Member activated." : "Member paused.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update status.";
      setMemberError(message);
    }
  };

  const handleToggleBookable = async () => {
    if (!member) return;

    setMemberNotice(null);
    setMemberError(null);

    try {
      const result = await toggleMemberBookable(member.id);
      setMember((prev) => (prev ? { ...prev, bookable: result.updated.bookable } : prev));
      setMemberNotice(result.updated.bookable ? "Member is now bookable." : "Member hidden from booking.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update bookable status.";
      setMemberError(message);
    }
  };

  const handleRoleChange = async (role: TeamMemberSummary["role"]) => {
    if (!member) return;

    setMemberNotice(null);
    setMemberError(null);

    try {
      const updated = await updateMemberRole(member.id, role);
      setMember((prev) => (prev ? { ...prev, role: updated.role, active: updated.active, bookable: updated.bookable } : prev));
      setMemberNotice("Role updated.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update role.";
      setMemberError(message);
    }
  };

  return (
    <div className="userOverview">
      <header className="userOverview__header">
        <div>
          <p className="userOverview__eyebrow">Team member</p>
          <h1 className="userOverview__title">{member ? `${member.firstName} ${member.lastName}` : "User overview"}</h1>
          <p className="userOverview__subtitle">Manage access, availability, and working hours for this teammate.</p>
          {member && (
            <p className="userOverview__muted">{member.email ?? "No email on file"}</p>
          )}
        </div>
        <div className="userOverview__actions">
          <Link className="userOverview__ghost" to={backToTeamHref}>
            ← Back to team
          </Link>
        </div>
      </header>

      {memberLoading && <p className="userOverview__state">Loading member…</p>}
      {memberError && <p className="userOverview__state userOverview__state--error">{memberError}</p>}

      <section className="userOverview__card" aria-label="Member access">
        <div className="userOverview__cardHeader">
          <div>
            <h2>Access & visibility</h2>
            <p className="userOverview__hint">Control the role, activity, and booking visibility of this person.</p>
          </div>
          {memberNotice && <span className="userOverview__pill">{memberNotice}</span>}
        </div>

        <div className="userOverview__grid">
          <div className="userOverview__field">
            <span className="userOverview__label">Role</span>
            <select
              className="userOverview__input"
              value={member?.role ?? ROLE_OPTIONS[2].value}
              onChange={(e) => handleRoleChange(e.target.value as TeamMemberSummary["role"])}
              disabled={!member}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <small className="userOverview__hint">Roles control what the teammate can manage in the shop.</small>
          </div>

          <label className="userOverview__toggle">
            <span>
              <strong>Active</strong>
              <small className="userOverview__hint">Inactive members cannot log in to this shop.</small>
            </span>
            <input type="checkbox" checked={Boolean(member?.active)} onChange={handleToggleActive} disabled={!member} />
          </label>

          <label className="userOverview__toggle">
            <span>
              <strong>Bookable</strong>
              <small className="userOverview__hint">Hide or show this teammate when customers book.</small>
            </span>
            <input
              type="checkbox"
              checked={Boolean(member?.bookable)}
              onChange={handleToggleBookable}
              disabled={!member}
            />
          </label>
        </div>
      </section>

      <section className="userOverview__card" aria-label="Working hours">
        <div className="userOverview__cardHeader">
          <div>
            <h2>Working hours</h2>
            <p className="userOverview__hint">Set the days and hours this teammate is available for bookings.</p>
          </div>
          {hoursStatus === "saved" && <span className="userOverview__pill">Saved</span>}
        </div>

        {hoursLoading && <p className="userOverview__state">Loading hours…</p>}
        {hoursError && <p className="userOverview__state userOverview__state--error">{hoursError}</p>}

        <div className="userOverview__hours">
          {week.map((schedule) => {
            const displayName = DAY_LABELS.find((d) => d.key === schedule.dayOfWeek)?.label ?? schedule.dayOfWeek;

            return (
              <div key={schedule.dayOfWeek} className="userOverview__hoursRow">
                <div className="userOverview__dayHeader">
                  <div className="userOverview__day">{displayName}</div>
                  <label className="userOverview__closed">
                    <input
                      type="checkbox"
                      checked={schedule.isOff}
                      onChange={(e) => toggleDayOff(schedule.dayOfWeek, e.target.checked)}
                    />
                    <span>Day off</span>
                  </label>
                </div>

                <div className="userOverview__blocks">
                  {schedule.isOff ? (
                    <div className="userOverview__closedNote">This day is marked as off.</div>
                  ) : (
                    schedule.slots.map((slot, index) => (
                      <div key={`${schedule.dayOfWeek}-${index}`} className="userOverview__timeBlock">
                        <div className="userOverview__timeInputs">
                          <label>
                            <span>Start</span>
                            <input
                              type="time"
                              value={slot.start}
                              onChange={(e) => updateSlot(schedule.dayOfWeek, index, "start", e.target.value)}
                            />
                          </label>

                          <label>
                            <span>End</span>
                            <input
                              type="time"
                              value={slot.end}
                              onChange={(e) => updateSlot(schedule.dayOfWeek, index, "end", e.target.value)}
                            />
                          </label>
                        </div>

                        {schedule.slots.length > 1 && (
                          <button
                            type="button"
                            className="userOverview__iconBtn"
                            onClick={() => removeSlot(schedule.dayOfWeek, index)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))
                  )}

                  {!schedule.isOff && (
                    <button type="button" className="userOverview__addBlock" onClick={() => addSlot(schedule.dayOfWeek)}>
                      + Add time block
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="userOverview__actionsBar">
          <button
            type="button"
            className="userOverview__primary"
            onClick={handleSaveHours}
            disabled={hoursStatus === "saving" || !memberId}
          >
            {hoursStatus === "saving" ? "Saving…" : "Save working hours"}
          </button>
          <button type="button" className="userOverview__ghost" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
};

export default UserOverview;