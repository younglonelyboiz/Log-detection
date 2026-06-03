import React from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MainContent from "./components/MainContent";
import style from "./dashboard.module.scss";

export default function Dashboard({ children }: { children: React.ReactNode }) {
  return (
    <div className={style.dashboard}>
      <Sidebar />
      <Header />
      <main className={style.mainContent}>{children}</main>
    </div>
  );
}
