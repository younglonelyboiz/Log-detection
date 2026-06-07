"use client";
import React from "react";
import { Layout } from "antd";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MainContent from "./components/MainContent";
import style from "./dashboard.module.scss";

const { Content } = Layout;

export default function Dashboard({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      <Layout style={{ minHeight: "100vh" }}>
        <Sidebar />
        <Layout className={style.layout}>
          <Header />
          <Content className={style.customContent}>
            <MainContent />
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
