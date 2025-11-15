import React from "react";
import { Outlet, Link, useParams } from "react-router-dom";

const ShopLayout: React.FC = () => {
  const { shopName } = useParams();

  return (
    <div>
      <header
        style={{
          padding: "1rem",
          borderBottom: "1px solid #ddd",
          marginBottom: "1rem",
        }}
      >
        <h2>Shop: {shopName}</h2>
        <nav>
          <Link to="">Overview</Link> |{" "}
          <Link to="calendar">Calendar</Link> |{" "}
          <Link to="bookings">Bookings</Link> |{" "}
          <Link to="bookings/new">Add Booking</Link> |{" "}
          <Link to="services">Services</Link> |{" "}
          <Link to="team">Team</Link> |{" "}
          <Link to="team/invite">Invite</Link>
        </nav>
      </header>

      <main style={{ padding: "0 1rem" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default ShopLayout;
