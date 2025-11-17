import React from "react";
import "./Overview.css";
import { useAuth } from "../../../providers/AuthProvider";

const Overview: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <p>Loading...</p>;
  return (
    <div>
      <h1>Overview</h1>
      <h3>{user.subscription}</h3>
      <h3>{user.email}</h3>
      {user.shops.map((e) => (
        <div key={e.id}>
          <p>{e.name}</p>
          <p>{e.role}</p>
        </div>
      ))}
    </div>
  );
};

export default Overview;
