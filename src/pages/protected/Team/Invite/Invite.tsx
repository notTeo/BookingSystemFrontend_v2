import React from "react";

import InviteForm from "./InviteForm";
import { useI18n } from "../../../../i18n";
import "./Invite.css";

const Invite: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="invitePage">
      <section className="card invitePage__card">
        <div className="invitePage__head">
          <h1>{t("Invite a teammate")}</h1>
          <p>{t("Send an invitation email with the correct role and a welcome note.")}</p>
        </div>

        <InviteForm />
      </section>
    </div>
  );
};

export default Invite;
