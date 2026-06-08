"use client";

import React from "react";
import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import { useRouter, usePathname } from "next/navigation";
import {
  HomeOutlined,
  UserOutlined,
  VerifiedOutlined,
} from "@ant-design/icons";
import style from "../dashboard.module.scss";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems: MenuProps["items"] = [
    {
      key: "/dashboard",
      icon: <HomeOutlined />,
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
  ];

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      theme="light"
      trigger={null}
      className={style.customSider}
    >
      <div className={style.logoArea}>
        <span
          style={{
            color: "#0ea5e9",
            fontWeight: 800,
            fontSize: "1.2rem",
          }}
        >
          Hệ thống<br></br>giám sát
        </span>
      </div>

      <Menu
        mode="inline"
        theme="light"
        selectedKeys={[pathname]}
        items={menuItems}
        onClick={({ key }) => router.push(key)}
      />
    </Sider>
  );
}
