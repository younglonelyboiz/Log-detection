import React from "react";
import style from "../dashboard.module.scss";

export default function Sidebar() {
  return (
    <aside className={style.sidebar}>
      <div className={style.logo}>
        <div className={style.logoIcon}></div>
        <div className={style.logoText}>Log Dashboard</div>
      </div>

      <ul className={style.menuList}>
        <li className={style.menuItem}>Home</li>
        <li className={style.menuItem}>Logs</li>
        <li className={style.menuItem}>Users</li>
        <li className={style.menuItem}>Settings</li>
      </ul>
    </aside>
  );
}
