import React from "react";
import style from "../dashboard.module.scss";

export default function MainContent() {
  return (
    <main className={style.mainContent}>
      <h1>Welcome to the Log Dashboard</h1>
      <p>This is where you can view and manage your logs.</p>
    </main>
  );
}
