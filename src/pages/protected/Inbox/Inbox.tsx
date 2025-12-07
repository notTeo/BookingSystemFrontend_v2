import React, { useCallback, useEffect, useMemo, useState } from "react";

import { acceptInvite, declineInvite, listInvites } from "../../../api/user";
import type { Invite } from "../../../types/shop";
import "./Inbox.css";

const statusLabels: Record<Invite["status"], string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
};

const roleLabels: Record<Invite["role"], string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  STAFF: "Staff",
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const Inbox: React.FC = () => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<number | null>(null);

  const loadInvites = useCallback(async () => {
    setLoading(true);
    setError(null);
  
    try {
      const res = await listInvites();
      console.log(res)
  
      // Normalize common API shapes:
      const maybeArray =
        Array.isArray(res) ? res :
        Array.isArray((res as any)?.data) ? (res as any).data :
        Array.isArray((res as any)?.invites) ? (res as any).invites :
        [];
  
      setInvites(maybeArray);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load inbox.";
      setError(message);
      setInvites([]); // keep state consistent
    } finally {
      setLoading(false);
    }
  }, []);
  

  useEffect(() => {
    void loadInvites();
  }, [loadInvites]);

  const sortedInvites = useMemo(() => {
    return invites.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [invites]);

  const handleAction = async (inviteId: number, action: "accept" | "decline") => {
    setActingOn(inviteId);
    setError(null);

    try {
      const updated =
        action === "accept" ? await acceptInvite(inviteId) : await declineInvite(inviteId);
      setInvites((prev) => prev.map((invite) => (invite.id === inviteId ? updated : invite)));
    } catch (err) {
      const message = err instanceof Error ? err.message : `Could not ${action} invite.`;
      setError(message);
    } finally {
      setActingOn(null);
    }
  };

  return (
    <div className="inboxPage">
      <header className="inboxPage__header">
        <div>
          <p className="inboxPage__eyebrow">Inbox</p>
          <h1 className="inboxPage__title">Invitations</h1>
          <p className="inboxPage__subtitle">Manage requests to join shops and respond directly.</p>
        </div>

        <div className="inboxPage__actions">
          <button className="btn btn--ghost" type="button" onClick={loadInvites} disabled={loading}>
            Refresh
          </button>
        </div>
      </header>

      <section className="card inboxPage__card" aria-label="Inbox invites">
        <div className="inboxPage__cardHead">
          <div>
            <h2>Pending actions</h2>
            <p className="inboxPage__hint">Review invitations and accept or decline.</p>
          </div>
          <span className="badge badge--primary">{sortedInvites.length} invites</span>
        </div>

        {loading && <p className="inboxPage__state">Loading invites…</p>}
        {error && <p className="inboxPage__state inboxPage__state--error">{error}</p>}

        {!loading && !error && sortedInvites.length === 0 && (
          <p className="inboxPage__state">No invites right now.</p>
        )}

        {!loading && !error && sortedInvites.length > 0 && (
          <div className="inboxPage__list">
            {sortedInvites.map((invite) => {
              const isPending = invite.status === "PENDING";
              return (
                <article key={invite.id} className="inboxPage__invite" aria-label={`Invite ${invite.id}`}>
                  <div className="inboxPage__inviteHeader">
                    <div className="inboxPage__identity">
                      <p className="inboxPage__eyebrow">Shop #{invite.shopId}</p>
                      <h3 className="inboxPage__inviteTitle">Join as {roleLabels[invite.role] ?? invite.role}</h3>
                      <p className="inboxPage__meta">Invited on {formatDate(invite.createdAt)}</p>
                    </div>
                    <span className={`inboxPage__status inboxPage__status--${invite.status.toLowerCase()}`}>
                      {statusLabels[invite.status] ?? invite.status}
                    </span>
                  </div>

                  {invite.message && <p className="inboxPage__message">“{invite.message}”</p>}

                  <div className="inboxPage__footer">
                    <p className="inboxPage__meta">Updated {formatDate(invite.updatedAt)}</p>
                    {isPending ? (
                      <div className="inboxPage__actions">
                        <button
                          className="btn btn--ghost"
                          type="button"
                          disabled={actingOn === invite.id}
                          onClick={() => handleAction(invite.id, "decline")}
                        >
                          {actingOn === invite.id ? "Declining…" : "Decline"}
                        </button>
                        <button
                          className="btn btn--primary"
                          type="button"
                          disabled={actingOn === invite.id}
                          onClick={() => handleAction(invite.id, "accept")}
                        >
                          {actingOn === invite.id ? "Accepting…" : "Accept"}
                        </button>
                      </div>
                    ) : (
                      <p className="inboxPage__muted">No further action available.</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Inbox;