"use client";

import React, { useMemo } from "react";
import { Row, Col, Card, Statistic, Space, Typography } from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  UserOutlined,
  ShoppingOutlined,
  UsergroupAddOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import LogGeneratorPanel from "./components/LogGeneratorPanel";
import { useLogWatcher } from "../../hooks/useLogWatcher";
import { Label } from "../../enums/label.enum";
import { OrderAction } from "../../enums/action.enum";

const { Title, Text } = Typography;

export default function DashboardOverview() {
  useLogWatcher();

  const logs = useSelector((state: RootState) => state.logs.logs);
  const users = useSelector((state: RootState) => state.users.users);

  const stats = useMemo(() => {
    return {
      total: logs.length,
      normal: logs.filter((l) => l.label === Label.NORMAL).length,
      error: logs.filter((l) => l.label === Label.ERROR).length,
      spam: logs.filter((l) => l.label === Label.SPAM).length,
      totalUsers: users.length,
      successfulOrders: logs.filter((l) => l.action === OrderAction.HOAN_THANH)
        .length,
      suspendedUsers: users.filter((u) => u.status === "suspended").length,
      spamUsers: users.filter((u) => u.status === "spam").length,
    };
  }, [logs, users]);

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
              title="Logs Lỗi trong ngày"
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
              title="Logs spam trong ngày"
              value={stats.spam}
              prefix={<WarningOutlined style={{ color: "#f59e0b" }} />}
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
              title="Tổng người dùng"
              value={stats.totalUsers}
              prefix={<UsergroupAddOutlined style={{ color: "#6366f1" }} />}
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
              title="Đơn hàng thành công"
              value={stats.successfulOrders}
              prefix={<ShoppingOutlined style={{ color: "#22c55e" }} />}
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
              title="Nghi ngờ trong ngày"
              value={stats.suspendedUsers}
              prefix={<UserOutlined style={{ color: "#eab308" }} />}
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
              title="User Spam trong ngày"
              value={stats.spamUsers}
              prefix={<StopOutlined style={{ color: "#dc2626" }} />}
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
