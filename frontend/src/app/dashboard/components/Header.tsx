"use client";

import React from "react";
import { Layout, Badge, Space, Typography } from "antd";
import styles from "../dashboard.module.scss";

const { Header: AntdHeader } = Layout;
const { Title, Text } = Typography;

export default function Header() {
  return (
    <AntdHeader className={styles.header}>
      <Title style={{ margin: 0, fontWeight: 600 }}>
        Hệ thống giam sát nhật kí
      </Title>
    </AntdHeader>
  );
}
