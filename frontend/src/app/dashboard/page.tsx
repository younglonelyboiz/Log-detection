"use client";

import React from "react";
import { Row, Col, Card, Statistic, Space, Typography } from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import LogGeneratorPanel from "./components/LogGeneratorPanel";

const { Title, Text } = Typography;

const stats = {
  total: 0,
  normal: 0,
  error: 0,
  spam: 0,
};

export default function DashboardOverview() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <div>
        <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
          Hệ Thống Giám Sát Nhật Ký
        </Title>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Statistic
              title="Tổng số Logs"
              value={stats.total}
              prefix={<FileTextOutlined style={{ color: "#0ea5e9" }} />}
              valueStyle={{ fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Statistic
              title="Logs Hợp Lệ"
              value={stats.normal}
              prefix={<CheckCircleOutlined style={{ color: "#10b981" }} />}
              valueStyle={{ fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Statistic
              title="Logs Lỗi"
              value={stats.error}
              prefix={<CloseCircleOutlined style={{ color: "#ef4444" }} />}
              valueStyle={{ fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Statistic
              title="Logs Spam"
              value={stats.spam}
              prefix={<WarningOutlined style={{ color: "#f59e0b" }} />}
              valueStyle={{ fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <LogGeneratorPanel />
        </Col>
      </Row>
    </div>
  );
}
