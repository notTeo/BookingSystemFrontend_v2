import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getActiveShopId } from "../../../../api/http";
import { getTeamOverview } from "../../../../api/team";
import type { TeamMemberSummary, TeamOverview } from "../../../../types/team";
import InviteForm from "../Invite/InviteForm";
import "./AllTeam.css";

const roleLabels: Record<string, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  STAFF: "Staff",
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const AllTeam: React.FC = () => {
  const [overview, setOverview] = useState<TeamOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  const shopId = getActiveShopId();

  const loadTeam = useCallback(async () => {
    if (!shopId) {
      setError("Select a shop to view its team.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getTeamOverview();
      setOverview(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load team.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const sortedMembers = useMemo(() => {
    if (!overview) return [];
    return overview.members.slice().sort((a, b) => a.firstName.localeCompare(b.firstName));
  }, [overview]);

  const activeCount = useMemo(() => overview?.activeMembers ?? 0, [overview]);

  const handleInviteSent = () => {
    setShowInvite(false);
    loadTeam();
  };

  return (

    <div className="teamPage">
      <header className="teamPage__header">
        <div>
          <p className="teamPage__eyebrow">Team</p>
          <h1 className="teamPage__title">Team members</h1>
          <p className="teamPage__subtitle">
            {overview?.shop?.name
              ? `People helping run ${overview.shop.name}.`
              : "Invite and manage staff for this shop."}
          </p>
        </div>

        <div className="teamPage__actions">
          <button className="btn btn--ghost" type="button" onClick={loadTeam}>
            Refresh
          </button>
          <button
            className="btn btn--primary"
            type="button"
            onClick={() => setShowInvite((prev) => !prev)}
          >
            {showInvite ? "Close" : "Invite member"}
          </button>
        </div>
      </header>

      {showInvite && (
        <section className="card teamPage__inviteCard" aria-label="Invite team member">
          <div className="teamPage__cardHead">
            <div>
              <h2>Invite a teammate</h2>
              <p className="teamPage__cardHint">
                Send an email invite with a role and optional welcome message.
              </p>
            </div>
            <Link className="teamPage__secondaryLink" to="../team/invite">
              Full invite page
            </Link>
          </div>
          <InviteForm onSent={handleInviteSent} />
        </section>
      )}

      <section className="teamPage__stats" aria-label="Team stats">
        <div className="card teamPage__stat">
          <p className="teamPage__statLabel">Total members</p>
          <p className="teamPage__statValue">{overview?.totalMembers ?? "-"}</p>
          <p className="teamPage__statHint">All users linked to this shop</p>
        </div>
        <div className="card teamPage__stat">
          <p className="teamPage__statLabel">Active</p>
          <p className="teamPage__statValue">{activeCount}</p>
          <p className="teamPage__statHint">Currently active members</p>
        </div>
        <div className="card teamPage__stat">
          <p className="teamPage__statLabel">Inactive</p>
          <p className="teamPage__statValue">{Math.max((overview?.totalMembers ?? 0) - activeCount, 0)}</p>
          <p className="teamPage__statHint">Paused or disabled</p>
        </div>
      </section>

      <section className="card teamPage__listCard" aria-label="Team members">
        <div className="teamPage__cardHead">
          <div>
            <h2>People</h2>
            <p className="teamPage__cardHint">Status, roles, and join dates for the team.</p>
          </div>
          {overview?.shop?.name && (
            <span className="badge badge--primary">{overview.shop.name}</span>
          )}
        </div>

        {isLoading && <p className="teamPage__state">Loading team…</p>}
        {error && <p className="teamPage__state teamPage__state--error">{error}</p>}

        {!isLoading && !error && sortedMembers.length === 0 && (
          <p className="teamPage__state">No team members yet. Invite someone to get started.</p>
        )}

        {!isLoading && !error && sortedMembers.length > 0 && (
          <div className="teamPage__table" role="table">
            <div className="teamPage__row teamPage__row--head" role="row">
              <div>Name</div>
              <div>Role</div>
              <div>Status</div>
              <div>Bookable</div>
              <div>Joined</div>
            </div>

            {sortedMembers.map((member: TeamMemberSummary) => (
              <div key={member.id} className="teamPage__row" role="row">
                <div className="teamPage__cellMain">
                  <div className="teamPage__avatar">
                    {member.firstName[0]}
                    {member.lastName[0]}
                  </div>
                  <div className="teamPage__identity">
                    <p className="teamPage__name">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="teamPage__email">{member.email ?? "No email"}</p>
                  </div>
                </div>

                <div>
                  <span className="teamPage__pill">{roleLabels[member.role] ?? member.role}</span>
                </div>

                <div>
                  <span
                    className={`teamPage__pill ${member.active ? "teamPage__pill--success" : "teamPage__pill--muted"}`}
                  >
                    {member.active ? "Active" : "Paused"}
                  </span>
                </div>

                <div>
                  <span
                    className={`teamPage__pill ${member.bookable ? "teamPage__pill--primary" : "teamPage__pill--muted"}`}
                  >
                    {member.bookable ? "Bookable" : "Not bookable"}
                  </span>
                </div>

                <div className="teamPage__muted">{formatDate(member.joinedAt)}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AllTeam;