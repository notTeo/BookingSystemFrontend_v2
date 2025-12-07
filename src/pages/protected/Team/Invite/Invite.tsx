import React from "react";

import InviteForm from "./InviteForm";
import "./Invite.css";

const Invite: React.FC = () => {
  return (
    <div className="invitePage">
      <section className="card invitePage__card">
        <div className="invitePage__head">
          <h1>Invite a teammate</h1>
          <p>Send an invitation email with the correct role and a welcome note.</p>
        </div>

        <InviteForm />
      </section>
    </div>
  );
};

export default Invite;