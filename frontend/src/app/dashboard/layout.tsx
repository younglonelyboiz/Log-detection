"use client";

import React, { useState } from "react";
import { Layout } from "antd";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import style from "./dashboard.module.scss";

const { Content } = Layout;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  // hook theo dõi logs thời gian thực tại layout chung (Đã tắt do không dùng Redux)

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout style={{ display: "flex", flexDirection: "column" }}>
        <Header collapsed={collapsed} toggle={() => setCollapsed(!collapsed)} />
        <Content className={style.customContent}>{children}</Content>
      </Layout>
    </Layout>
  );
}
