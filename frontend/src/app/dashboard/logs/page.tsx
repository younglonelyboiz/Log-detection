"use client";

import React, { useState, useEffect } from "react";
import { Table, Tag, Card, Select, Space, Typography, message } from "antd";
import { Label } from "../../../enums/label.enum";
import { logService } from "../../../services/log.service";
import { LogDetect } from "../../../redux/logsSlice";

const { Title, Text } = Typography;
const { Option } = Select;

export default function LogsPage() {
  const [logs, setLogs] = useState<LogDetect[]>([]);
  const [labelFilter, setLabelFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const fetchLogs = (page: number, label: string) => {
    const limit = 10;
    const offset = (page - 1) * limit;
    logService.getAllDetectedLogs(limit, offset, label)
      .then((res) => {
        setLogs(res.data);
        setTotal(res.total);
      })
      .catch((err) => {
        console.error(err);
        message.error("Lỗi khi tải nhật ký từ máy chủ");
      });
  };

  useEffect(() => {
    fetchLogs(currentPage, labelFilter);
  }, [currentPage, labelFilter]);

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
      render: (text: string) => <Text>{new Date(text).toLocaleString("vi-VN")}</Text>,
      sorter: (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      defaultSortOrder: 'descend' as const,
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
            onChange={(value) => {
              setLabelFilter(value);
              setCurrentPage(1);
            }}
            style={{ width: 180 }}
          >
            <Option value="all">Tất cả phân loại</Option>
            <Option value={Label.NORMAL}>Bình thường</Option>
            <Option value={Label.ERROR}>Lỗi</Option>
            <Option value={Label.SPAM}>Spam</Option>
          </Select>
        </Space>

        <Table
          dataSource={logs}
          columns={columns}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: 10,
            total: total,
            onChange: (page) => setCurrentPage(page),
          }}
          size="middle"
          locale={{ emptyText: "Không có nhật ký nào." }}
        />
      </Card>
    </div>
  );
}
