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

type InviteBuckets = {
  received: Invite[];
  sent: Invite[];
};

const EMPTY_BUCKETS: InviteBuckets = { received: [], sent: [] };

const Inbox: React.FC = () => {
  const [buckets, setBuckets] = useState<InviteBuckets>(EMPTY_BUCKETS);
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<number | null>(null);

  const loadInvites = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await listInvites();
      console.log(res)
      const received = Array.isArray((res as any)?.received) ? (res as any).received : [];
      const sent = Array.isArray((res as any)?.sent) ? (res as any).sent : [];

      setBuckets({ received, sent });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load inbox.";
      setError(message);
      setBuckets(EMPTY_BUCKETS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInvites();
  }, [loadInvites]);

  const currentList = useMemo(() => {
    const list = activeTab === "received" ? buckets.received : buckets.sent;
    return list
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activeTab, buckets.received, buckets.sent]);

  const counts = useMemo(() => {
    const received = buckets.received.length;
    const sent = buckets.sent.length;
    const receivedPending = buckets.received.filter((i) => i.status === "PENDING").length;
    return { received, sent, receivedPending };
  }, [buckets.received, buckets.sent]);

  const handleAction = async (inviteId: number, action: "accept" | "decline") => {
    setActingOn(inviteId);
    setError(null);

    try {
      const updated =
        action === "accept" ? await acceptInvite(inviteId) : await declineInvite(inviteId);

      // Actions apply to RECEIVED invites (the one you were invited to)
      setBuckets((prev) => ({
        ...prev,
        received: prev.received.map((inv) =>
          inv.id === inviteId ? { ...inv, ...(updated as Partial<Invite>) } : inv,
        ),
      }));
      
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
          <p className="inboxPage__subtitle">View received or sent invitations.</p>
        </div>

        <div className="inboxPage__headerActions">
          <button className="btn btn--ghost" type="button" onClick={loadInvites} disabled={loading}>
            Refresh
          </button>
        </div>
      </header>

      <section className="card inboxPage__card" aria-label="Inbox invites">
        <div className="inboxPage__cardHead">
          <div className="inboxPage__cardHeadLeft">
            <h2>Invites</h2>
            <p className="inboxPage__hint">
              Received pending: <strong>{counts.receivedPending}</strong>
            </p>
          </div>

          <div className="inboxPage__tabs" role="tablist" aria-label="Invite tabs">
            <button
              type="button"
              className={`inboxPage__tab ${activeTab === "received" ? "is-active" : ""}`}
              onClick={() => setActiveTab("received")}
              role="tab"
              aria-selected={activeTab === "received"}
            >
              Received <span className="inboxPage__tabCount">{counts.received}</span>
            </button>

            <button
              type="button"
              className={`inboxPage__tab ${activeTab === "sent" ? "is-active" : ""}`}
              onClick={() => setActiveTab("sent")}
              role="tab"
              aria-selected={activeTab === "sent"}
            >
              Sent <span className="inboxPage__tabCount">{counts.sent}</span>
            </button>
          </div>
        </div>

        {loading && <p className="inboxPage__state">Loading invites…</p>}
        {error && <p className="inboxPage__state inboxPage__state--error">{error}</p>}

        {!loading && !error && currentList.length === 0 && (
          <p className="inboxPage__state">
            {activeTab === "received" ? "No received invites right now." : "No sent invites right now."}
          </p>
        )}

        {!loading && !error && currentList.length > 0 && (
          <div className="inboxPage__list">
            {currentList.map((invite) => {
              const isPending = invite.status === "PENDING";
              const canAct = activeTab === "received" && isPending;

              return (
                <article key={invite.id} className="inboxPage__invite" aria-label={`Invite ${invite.id}`}>
                  <div className="inboxPage__inviteHeader">
                    <div className="inboxPage__identity">
                      <p className="inboxPage__mini">
                        {activeTab === "received" ? "Invite to join" : "Invite sent"}
                      </p>
                      <h3 className="inboxPage__inviteTitle">
                        Shop: {invite.shop.name} — {roleLabels[invite.role] ?? invite.role}
                      </h3>
                      <p className="inboxPage__meta">
                        Sent from {invite.sender.firstName} {invite.sender.lastName}, {invite.sender.email}
                      </p>
                      <p className="inboxPage__meta">Created {formatDate(invite.createdAt)}</p>
                    </div>

                    <span className={`inboxPage__status inboxPage__status--${invite.status.toLowerCase()}`}>
                      {statusLabels[invite.status] ?? invite.status}
                    </span>
                  </div>

                  {invite.message && <p className="inboxPage__message">“{invite.message}”</p>}

                  <div className="inboxPage__footer">

                    {canAct ? (
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
                      <p className="inboxPage__muted">
                        {activeTab === "sent" ? "You can’t act on sent invites." : "No further action available."}
                      </p>
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
