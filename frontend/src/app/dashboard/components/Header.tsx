import React from "react";
import style from "../dashboard.module.scss";

export default function Header() {
  return (
    <header className={style.header}>
      <div className={style.logo}>
        <div className={style.logoIcon}></div>
        <div className={style.logoText}>Log Dashboard</div>
      </div>
    </header>
  );
}
