"use client";

import React from "react";
import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import { useRouter, usePathname } from "next/navigation";
import {
  DashOutlined,
  UserOutlined,
  VerifiedOutlined,
  SlidersOutlined,
} from "@ant-design/icons";
import style from "../dashboard.module.scss";

const { Sider } = Layout;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems: MenuProps["items"] = [
    {
      key: "/dashboard",
      icon: <DashOutlined />,
      label: "Dashboard",
    },
    {
      key: "/dashboard/users",
      icon: <UserOutlined />,
      label: "Users",
    },
    {
      key: "/dashboard/logs",
      icon: <VerifiedOutlined />,
      label: "Logs",
    },
    {
      key: "/dashboard/settings",
      icon: <SlidersOutlined />,
      label: "Settings",
    },
  ];

  return (
    <Sider breakpoint="lg" collapsedWidth="0" className={style.customSider}>
      <div className={style.logoArea}>
        <h2
          style={{
            color: "#0ea5e9",
            fontWeight: 800,
            fontSize: "1.2rem",
          }}
        >
          Giám Sát Nhật Kí
        </h2>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        items={menuItems}
        onClick={({ key }) => router.push(key)}
      />
    </Sider>
  );
}
