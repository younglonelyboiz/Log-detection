"use client";

import React from "react";
import { Layout, Button, Space, Typography, Badge } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import styles from "../dashboard.module.scss";

const { Header: AntdHeader } = Layout;
const { Title } = Typography;

interface HeaderProps {
  collapsed: boolean;
  toggle: () => void;
}

export default function Header({ collapsed, toggle }: HeaderProps) {
  return (
    <AntdHeader className={styles.customHeader}>
      <Space size="small">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggle}
          style={{
            fontSize: "18px",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
        <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
          Hệ thống giám sát nhật ký
        </Title>
      </Space>
    </AntdHeader>
  );
}
