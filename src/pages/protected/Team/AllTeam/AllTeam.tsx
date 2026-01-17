import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getActiveShopId } from "../../../../api/http";
import { getTeamOverview } from "../../../../api/team";
import type { TeamMemberSummary, TeamOverview } from "../../../../types/team";
import InviteForm from "../Invite/InviteForm";
import { useI18n } from "../../../../i18n";
import "./AllTeam.css";

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
  const { t } = useI18n();
  const [overview, setOverview] = useState<TeamOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  const shopId = getActiveShopId();
  const { shopName } = useParams();
  const navigate = useNavigate();

  const loadTeam = useCallback(async () => {
    if (!shopId) {
      setError(t("Select a shop to view its team."));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getTeamOverview();
      setOverview(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("Failed to load team.");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [shopId, t]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const sortedMembers = useMemo(() => {
    if (!overview) return [];
    return overview.members.slice().sort((a, b) => a.firstName.localeCompare(b.firstName));
  }, [overview]);

  const activeCount = useMemo(() => overview?.activeMembers ?? 0, [overview]);

  const roleLabels: Record<string, string> = useMemo(
    () => ({
      OWNER: t("Owner"),
      MANAGER: t("Manager"),
      STAFF: t("Staff"),
    }),
    [t],
  );

  const handleInviteSent = () => {
    setShowInvite(false);
    loadTeam();
  };

  const navigateToMember = (member: TeamMemberSummary) => {
    if (!shopName) return;

    navigate(`/shops/${encodeURIComponent(shopName)}/team/${member.shopUserId}`, {
      state: { member },
    });
  };

  return (
    <div className="teamPage">
      <header className="teamPage__header">
        <div>
          <h1 className="teamPage__title">{t("Team members")}</h1>
          <p className="teamPage__subtitle">
            {overview?.shop?.name
              ? `${t("People helping run")} ${overview.shop.name}.`
              : t("Invite and manage staff for this shop.")}
          </p>
        </div>

        <div className="teamPage__actions">
          <button className="btn btn--ghost" type="button" onClick={loadTeam}>
            {t("Refresh")}
          </button>
          <button
            className="btn btn--primary"
            type="button"
            onClick={() => setShowInvite((prev) => !prev)}
          >
            {showInvite ? t("Close") : t("Invite member")}
          </button>
        </div>
      </header>

      {showInvite && (
        <section className="card teamPage__inviteCard" aria-label="Invite team member">
          <div className="teamPage__cardHead">
            <div>
              <h2>{t("Invite a teammate")}</h2>
              <p className="teamPage__cardHint">
                {t("Send an email invite with a role and optional welcome message.")}
              </p>
            </div>
            <Link className="teamPage__secondaryLink" to="../team/invite">
              {t("Full invite page")}
            </Link>
          </div>
          <InviteForm onSent={handleInviteSent} />
        </section>
      )}

      <section className="teamPage__stats" aria-label="Team stats">
        <div className="card teamPage__stat">
          <p className="teamPage__statLabel">{t("Total members")}</p>
          <p className="teamPage__statValue">{overview?.totalMembers ?? "-"}</p>
          <p className="teamPage__statHint">{t("All users linked to this shop")}</p>
        </div>
        <div className="card teamPage__stat">
          <p className="teamPage__statLabel">{t("Active")}</p>
          <p className="teamPage__statValue">{activeCount}</p>
          <p className="teamPage__statHint">{t("Currently active members")}</p>
        </div>
        <div className="card teamPage__stat">
          <p className="teamPage__statLabel">{t("Inactive")}</p>
          <p className="teamPage__statValue">
            {Math.max((overview?.totalMembers ?? 0) - activeCount, 0)}
          </p>
          <p className="teamPage__statHint">{t("Paused or disabled")}</p>
        </div>
      </section>

      <section className="card teamPage__listCard" aria-label="Team members">
        <div className="teamPage__cardHead">
          <div>
            <h2>{t("People")}</h2>
            <p className="teamPage__cardHint">{t("Status, roles, and join dates for the team.")}</p>
          </div>
          {overview?.shop?.name && (
            <span className="badge badge--primary">{overview.shop.name}</span>
          )}
        </div>

        {isLoading && <p className="teamPage__state">{t("Loading team…")}</p>}
        {error && <p className="teamPage__state teamPage__state--error">{error}</p>}

        {!isLoading && !error && sortedMembers.length === 0 && (
          <p className="teamPage__state">{t("No team members yet. Invite someone to get started.")}</p>
        )}

        {!isLoading && !error && sortedMembers.length > 0 && (
          <div className="teamPage__table" role="table">
            <div className="teamPage__row teamPage__row--head" role="row">
              <div>{t("Name")}</div>
              <div>{t("Role")}</div>
              <div>{t("Status")}</div>
              <div>{t("Bookable")}</div>
              <div>{t("Joined")}</div>
              <div className="teamPage__actionsHead">{t("Actions")}</div>
            </div>

            {sortedMembers.map((member: TeamMemberSummary) => (
              <div
                key={member.id}
                className="teamPage__row teamPage__row--clickable"
                role="row"
                tabIndex={0}
                onClick={() => navigateToMember(member)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigateToMember(member);
                  }
                }}
                aria-label={`${t("View")} ${member.firstName} ${member.lastName}`}
              >
                <div className="teamPage__cellMain">
                  <div className="teamPage__avatar">
                    {member.firstName[0]}
                    {member.lastName[0]}
                  </div>
                  <div className="teamPage__identity">
                    <p className="teamPage__name">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="teamPage__email">{member.email ?? t("No email")}</p>
                  </div>
                </div>

                <div>
                  <span className="teamPage__pill">{roleLabels[member.role] ?? member.role}</span>
                </div>

                <div>
                  <span
                    className={`teamPage__pill ${member.active ? "teamPage__pill--success" : "teamPage__pill--muted"}`}
                  >
                    {member.active ? t("Active") : t("Paused")}
                  </span>
                </div>

                <div>
                  <span
                    className={`teamPage__pill ${member.bookable ? "teamPage__pill--primary" : "teamPage__pill--muted"}`}
                  >
                    {member.bookable ? t("Bookable") : t("Not bookable")}
                  </span>
                </div>

                <div className="teamPage__muted">{formatDate(member.joinedAt)}</div>
                <div className="teamPage__actionCell">
                  <button
                    type="button"
                    className="teamPage__manageButton"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToMember(member);
                    }}
                  >
                    {t("Configure")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AllTeam;
