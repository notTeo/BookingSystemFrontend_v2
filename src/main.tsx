import React from "react";
import ReactDOM from "react-dom/client";

import Router from "./Router";

import "./styles/theme.css";

const savedTheme = typeof localStorage !== "undefined" ? localStorage.getItem("theme") : null;
const initialTheme = savedTheme === "light" ? "light" : "dark";
document.documentElement.dataset.theme = initialTheme;


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
);
