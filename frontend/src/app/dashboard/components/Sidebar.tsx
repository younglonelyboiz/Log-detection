"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import style from "../dashboard.module.scss";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "fa-solid fa-chart-pie" },
    {
      name: "Quản lý Users",
      path: "/dashboard/users",
      icon: "fa-regular fa-user",
    },
    {
      name: "Quản lý nhật ký",
      path: "/dashboard/logs",
      icon: "fa-solid fa-terminal",
    },
    { name: "Cài đặt", path: "/dashboard/settings", icon: "fa-solid fa-gear" },
  ];

  return (
    <aside className={style.sidebar}>
      <div className={style.logo}>
        <div className={style.logoIcon}></div>
        <div className={style.logoText}>Log Dashboard</div>
      </div>

      <ul className={style.menuList}>
        {menuItems.map((item) => (
          <li key={item.path} className={style.menuItem}>
            <Link href={item.path}>
              <i className={item.icon}></i> {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
