"use client";

import React, { useMemo, useState, useEffect } from "react";
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
import { logService } from "../../services/log.service";

const { Title, Text } = Typography;

export default function DashboardOverview() {
  useLogWatcher();

  const reduxLogStats = useSelector((state: RootState) => state.logs.stats);
  const reduxUserStats = useSelector((state: RootState) => state.users.stats);

  const [dbStats, setDbStats] = useState({
    total: 0,
    totalUsers: 0,
    successfulOrders: 0,
    normal: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await logService.getDashboardStats();
        setDbStats(data);
      } catch (error) {
        console.error("Lỗi lấy mongodb", error);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    return {
      total: dbStats.total,
      normal: dbStats.normal,
      error: reduxLogStats.error,
      spam: reduxLogStats.spam,
      totalUsers: dbStats.totalUsers,
      successfulOrders: dbStats.successfulOrders,
      suspendedUsers: reduxUserStats.suspended,
      spamUsers: reduxUserStats.spam,
    };
  }, [reduxLogStats, reduxUserStats, dbStats]);

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
              title="Logs Lỗi / 24h qua"
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
              title="Logs spam / 24h qua"
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
              title="Nghi ngờ/ 24h qua"
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
              title="User Spam / 24h qua"
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
