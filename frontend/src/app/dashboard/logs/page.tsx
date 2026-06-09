"use client";

import React, { useState } from "react";
import { Table, Tag, Card, Select, Space, Typography } from "antd";
import { Label } from "../../../enums/label.enum";

const { Title, Text } = Typography;
const { Option } = Select;

const logs: any[] = [];

export default function LogsPage() {
  const [labelFilter, setLabelFilter] = useState<string>("all");

  const filteredLogs = logs.filter((log) => {
    return labelFilter === "all" ? true : log.label === labelFilter;
  });

  const columns = [
    {
      title: "ID Log",
      dataIndex: "id",
      key: "id",
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: "Thời gian",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: "ID Đơn Hàng",
      dataIndex: "orderId",
      key: "orderId",
      render: (text: string) => <Text>{text}</Text>,
    },

    {
      title: "ID Người dùng",
      dataIndex: "userID",
      key: "userID",
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Phân loại",
      dataIndex: "label",
      key: "label",
      render: (label: Label) => {
        let color = "processing";
        let labelText = "Bình thường";
        if (label === Label.ERROR) {
          color = "error";
          labelText = "Lỗi";
        } else if (label === Label.SPAM) {
          color = "warning";
          labelText = "Spam";
        }
        return <Tag color={color}>{labelText}</Tag>;
      },
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      render: (text: string) => <Text>{text || "-"}</Text>,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
            Nhật Ký Hệ Thống
          </Title>
        </div>
      </div>

      <Card
        style={{
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          borderRadius: "12px",
        }}
      >
        <Space
          style={{
            marginBottom: 20,
            width: "100%",
            justifyContent: "space-between",
          }}
          wrap
        >
          <Select
            defaultValue={Label.ERROR}
            value={labelFilter}
            onChange={(value) => setLabelFilter(value)}
            style={{ width: 180 }}
          >
            <Option value="all">Tất cả phân loại</Option>
            <Option value={Label.NORMAL}>Bình thường</Option>
            <Option value={Label.ERROR}>Lỗi</Option>
            <Option value={Label.SPAM}>Spam</Option>
          </Select>
        </Space>

        <Table
          dataSource={filteredLogs}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="middle"
          locale={{ emptyText: "Không có nhật ký nào." }}
        />
      </Card>
    </div>
  );
}
