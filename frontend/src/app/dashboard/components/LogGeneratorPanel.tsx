"use client";

import React, { useState } from "react";
import {
  Form,
  InputNumber,
  Button,
  Select,
  Radio,
  Card,
  message,
  Space,
  Typography,
} from "antd";
import {
  FireOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

import { logService } from "../../../services/log.service";
import { Label } from "../../../enums/label.enum";
import { OrderAction } from "../../../enums/action.enum";

const { Paragraph } = Typography;

export default function LogGeneratorPanel() {
  const [scenario, setScenario] = useState<Label>(Label.NORMAL);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleGenerate = async (values: any) => {
    setLoading(true);

    try {
      if (scenario === Label.NORMAL) {
        await logService.generateNormalLog();
      } else if (scenario === Label.ERROR) {
        await logService.generateErrorLog(values.quantity ?? 1);
      } else if (scenario === Label.SPAM) {
        await logService.generateSpamLog(
          values.action ?? OrderAction.DAT_HANG,
          values.quantity ?? 20,
        );
      }

      message.success(
        `Kích hoạt thành công kịch bản log ${scenario.toUpperCase()}!`,
      );
      form.resetFields(["quantity"]);
    } catch (err: any) {
      console.error(err);
      message.error(err.message || "Gặp lỗi khi gửi yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={
        <Space>
          <FireOutlined style={{ color: "#0ea5e9" }} />
          <span>Bảng Điều Khiển</span>
        </Space>
      }
      style={{
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        borderRadius: "12px",
      }}
    >
      <Paragraph>
        Chọn một kịch bản giao dịch giả lập bên dưới để kích hoạt gửi về hệ
        thống giám sát.
      </Paragraph>

      <Radio.Group
        value={scenario}
        onChange={(e) => setScenario(e.target.value)}
        optionType="button"
        buttonStyle="solid"
        style={{ marginBottom: 24, display: "flex", gap: "8px" }}
      >
        <Radio.Button value={Label.NORMAL} style={{ borderRadius: "6px" }}>
          <Space>
            <CheckCircleOutlined />
            Bình thường
          </Space>
        </Radio.Button>
        <Radio.Button value={Label.ERROR} style={{ borderRadius: "6px" }}>
          <Space>
            <WarningOutlined />
            Lỗi Logic
          </Space>
        </Radio.Button>
        <Radio.Button value={Label.SPAM} style={{ borderRadius: "6px" }}>
          <Space>
            <FireOutlined />
            Hành Vi Spam
          </Space>
        </Radio.Button>
      </Radio.Group>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleGenerate}
        initialValues={{ quantity: 1, action: OrderAction.DAT_HANG }}
      >
        {scenario === Label.NORMAL && (
          <div style={{ padding: "8px 0 20px 0" }}>
            <Paragraph type="secondary">
              Kịch bản bình thường mô phỏng một đơn hàng thành công hoàn tất các
              giai đoạn hợp lệ: Đặt hàng → Xác nhận → Thanh toán → Giao hàng →
              Hoàn thành.
            </Paragraph>
          </div>
        )}

        {scenario === Label.ERROR && (
          <Form.Item
            label="Số lượng sản phẩm vượt mức (Gây lỗi logic)"
            name="quantity"
            rules={[{ required: true }]}
          >
            <InputNumber
              min={11}
              max={100}
              placeholder="Chọn số lượng > 10"
              style={{ width: "100%" }}
            />
          </Form.Item>
        )}

        {scenario === Label.SPAM && (
          <Space style={{ width: "100%" }} direction="vertical" size="middle">
            <Form.Item
              label="Hành động cần Spam liên tục"
              name="action"
              rules={[{ required: true }]}
            >
              <Select placeholder="Chọn hành động">
                {Object.values(OrderAction).map((action) => (
                  <Select.Option key={action} value={action}>
                    {action}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Số lượng hành động gửi đồng thời (Spam count)"
              name="quantity"
              rules={[{ required: true }]}
            >
              <InputNumber min={5} max={50} style={{ width: "100%" }} />
            </Form.Item>
          </Space>
        )}

        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{
              height: "40px",
              fontWeight: 600,
              background:
                scenario === Label.ERROR
                  ? "#ff4d4f"
                  : scenario === Label.SPAM
                    ? "#fa8c16"
                    : "#0ea5e9",
            }}
          >
            Mô phỏng Giao Dịch
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
