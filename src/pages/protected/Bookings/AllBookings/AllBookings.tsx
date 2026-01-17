import React from "react";
import "./AllBookings.css";
import { useI18n } from "../../../../i18n";

const AllBookings: React.FC = () => {
  const { t } = useI18n();

  return (
    <div>
      <h1>{t("All bookings")}</h1>
    </div>
  );
};

export default AllBookings;
