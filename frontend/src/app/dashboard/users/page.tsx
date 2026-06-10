"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Card,
  Button,
  message,
  Typography,
  Select,
  Space,
  Modal,
} from "antd";
import { LockOutlined, UnlockOutlined, EyeOutlined } from "@ant-design/icons";
import { userService } from "../../../services/user.service";
import { logService } from "../../../services/log.service";
import { UserStatus } from "../../../enums/user-status.enum";
import { User } from "../../../redux/usersSlice";
import { LogDetect } from "../../../redux/logsSlice";

const { Title, Text } = Typography;
const { Option } = Select;

export default function UsersPage() {

  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  const [isLogsModalVisible, setIsLogsModalVisible] = useState(false);
  const [selectedUserLogs, setSelectedUserLogs] = useState<LogDetect[]>([]);
  const [selectedUserName, setSelectedUserName] = useState("");

  const fetchUsers = (page: number, status: string) => {
    userService.getUsers(page, 10, status)
      .then((res) => {
        setUsers(res.data);
        setTotalUsers(res.total);
      })
      .catch((err) => {
        console.error(err);
        message.error("Lỗi khi tải danh sách người dùng");
      });
  };

  useEffect(() => {
    fetchUsers(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  const handleViewLogs = async (user: User) => {
    setSelectedUserName(user.name);
    setIsLogsModalVisible(true);
    try {
      const logs = await logService.getDetectedLogsByUser(user.id);
      setSelectedUserLogs(logs);
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi lấy log của người dùng");
    }
  };

  const handleToggleBlock = async (user: User) => {
    const newStatus =
      user.status === UserStatus.BLOCKED
        ? UserStatus.ACTIVE
        : UserStatus.BLOCKED;

    try {
      await userService.updateUserStatus(user.id, newStatus);

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === user.id ? { ...u, status: newStatus } : u
        )
      );

      message.success(
        `Đã ${newStatus === UserStatus.BLOCKED ? "chặn" : "kích hoạt lại"} ${user.name}!`,
      );
    } catch (err: any) {
      console.error(err);
      message.error("Gặp lỗi khi cập nhật trạng thái.");
    }
  };

  const filteredUsers = users;
  const logColumns = [
    {
      title: "Thời gian",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (text: string) => <Text>{new Date(text).toLocaleString("vi-VN")}</Text>,
    },
    {
      title: "ID Đơn Hàng",
      dataIndex: "orderId",
      key: "orderId",
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
      render: (label: string) => {
        let color = "processing";
        let labelText = "Bình thường";
        if (label === "error") {
          color = "error";
          labelText = "Lỗi";
        } else if (label === "spam") {
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
      sorter: (a: User, b: User) => a.name.localeCompare(b.name),
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
      sorter: (a: User, b: User) => a.status.localeCompare(b.status),
      render: (status: UserStatus) => {
        let color = "success";
        let label = "Bình thường";

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
        <Space>
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
            onClick={() => handleToggleBlock(record)}
            size="small"
          >
            {record.status === UserStatus.BLOCKED ? "Mở khóa" : "Chặn"}
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewLogs(record)}
            size="small"
          >
            Xem Logs
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
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
            onChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
            style={{ width: 180 }}
          >
            <Option value="all">Tất cả Trạng thái</Option>
            <Option value={UserStatus.ACTIVE}>Bình Thường</Option>
            <Option value={UserStatus.BLOCKED}>Đã khóa</Option>
            <Option value={UserStatus.SPAM}>Phát hiện Spam</Option>
            <Option value={UserStatus.SUSPENDED}>Nghi Ngờ</Option>
          </Select>
        </Space>

        <Table
          dataSource={filteredUsers}
          columns={columns}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: 10,
            total: totalUsers,
            onChange: (page) => setCurrentPage(page),
          }}
          size="middle"
          locale={{ emptyText: "Không có người dùng nào." }}
        />
      </Card>

      <Modal
        title={`Chi tiết Logs của ${selectedUserName}`}
        open={isLogsModalVisible}
        onCancel={() => setIsLogsModalVisible(false)}
        width={800}
      >
        <Table
          dataSource={selectedUserLogs}
          columns={logColumns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          size="small"
          locale={{ emptyText: "Người dùng này chưa có log nào." }}
        />
      </Modal>
    </div>
  );
}
