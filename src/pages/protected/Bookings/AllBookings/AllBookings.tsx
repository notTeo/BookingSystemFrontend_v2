import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./AllBookings.css";
import { listBookings } from "../../../../api/bookings";
import type { BookingWithRelations } from "../../../../types/bookings";
import { useI18n } from "../../../../i18n";
const AllBookings: React.FC = () => {
  const { t } = useI18n();
  const { shopName } = useParams();
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listBookings()
      .then((data) => { if (alive) setBookings(data); })
      .catch((e) => { if (alive) setError(e?.message || t("Failed to load bookings.")); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [t]);

   return (
     <div>
       <h1>{t("All bookings")}</h1>
      {loading && <p>{t("Loading…")}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && bookings.length === 0 && <p>{t("No bookings found.")}</p>}
     {!loading && !error && bookings.length > 0 && (
        <table>
          <thead><tr><th>{t("ID")}</th><th>{t("Customer")}</th><th>{t("Service")}</th><th>{t("Status")}</th><th>{t("Time")}</th></tr></thead>
          <tbody>
           {bookings.map((b) => (
              <tr key={b.id}>
                <td>#{b.id}</td>
                <td>{b.customer?.name ?? "—"}</td>
               <td>{b.service?.name ?? "—"}</td>
                <td>{b.status ?? "—"}</td>
                <td>{b.startTime ? new Date(b.startTime).toLocaleString() : "—"}</td>
             </tr>
            ))}
          </tbody>
       </table>
      )}
      {shopName && (
        <Link className="btn btn--primary" to={`/shops/${encodeURIComponent(shopName)}/bookings/new`}>
         {t("New booking")}
        </Link>
      )}
     </div>
   );
 };
 
 export default AllBookings;