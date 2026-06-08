"use client";

import React, { useState } from "react";
import {
  Table,
  Tag,
  Card,
  Button,
  message,
  Typography,
  Select,
  Space,
} from "antd";
import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { userService } from "../../../services/user.service";
import { UserStatus } from "../../../enums/user-status.enum";

export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
}

const { Title, Text } = Typography;
const { Option } = Select;

const users: User[] = [];

export default function UsersPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );

  const handleToggleBlock = async (user: User) => {
    const newStatus =
      user.status === UserStatus.BLOCKED
        ? UserStatus.ACTIVE
        : UserStatus.BLOCKED;
    setActionLoading((prev) => ({ ...prev, [user.id]: true }));

    try {
      await userService.updateUserStatus(user.id, newStatus);

      message.success(
        `Đã ${newStatus === UserStatus.BLOCKED ? "chặn" : "kích hoạt lại"} ${user.name}!`,
      );
    } catch (err: any) {
      console.error(err);
      message.error("Gặp lỗi khi cập nhật trạng thái.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  const filteredUsers = users.filter((user) => {
    return statusFilter === "all" ? true : user.status === statusFilter;
  });

  const columns = [
    {
      title: "Mã Người Dùng",
      dataIndex: "id",
      key: "id",
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: "Họ và Tên",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text style={{ fontWeight: 600 }}>{text}</Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: UserStatus) => {
        let color = "success";
        let label = "Đang hoạt động";

        if (status === UserStatus.BLOCKED) {
          color = "error";
          label = "Đã khóa";
        } else if (status === UserStatus.SPAM) {
          color = "warning";
          label = "Spam";
        } else if (status === UserStatus.SUSPENDED) {
          color = "default";
          label = "Nghi Ngờ";
        }

        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: User) => (
        <Button
          type="primary"
          ghost
          danger={record.status !== UserStatus.BLOCKED}
          icon={
            record.status === UserStatus.BLOCKED ? (
              <UnlockOutlined />
            ) : (
              <LockOutlined />
            )
          }
          loading={actionLoading[record.id]}
          onClick={() => handleToggleBlock(record)}
          size="small"
        >
          {record.status === UserStatus.BLOCKED ? "Mở khóa" : "Chặn"}
        </Button>
      ),
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
            Quản Lý Người Dùng
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
            defaultValue={UserStatus.SPAM}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            style={{ width: 180 }}
          >
            <Option value="all">Tất cả Trạng thái</Option>
            <Option value={UserStatus.ACTIVE}>Đang hoạt động</Option>
            <Option value={UserStatus.BLOCKED}>Đã khóa</Option>
            <Option value={UserStatus.SPAM}>Phát hiện Spam</Option>
            <Option value={UserStatus.SUSPENDED}>Nghi Ngờ</Option>
          </Select>
        </Space>

        <Table
          dataSource={filteredUsers}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="middle"
          locale={{ emptyText: "Không có người dùng nào." }}
        />
      </Card>
    </div>
  );
}
