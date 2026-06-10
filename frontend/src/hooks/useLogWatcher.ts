"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { notification } from "antd";
import { RootState } from "../redux/store";
import { addLogs, LogDetect } from "../redux/logsSlice";
import { setUsers, User } from "../redux/usersSlice";

import { logService } from "../services/log.service";
import { userService } from "../services/user.service";
import { Label } from "../enums/label.enum";

export function useLogWatcher() {
  const dispatch = useDispatch();
  const existingLogs = useSelector((state: RootState) => state.logs.logs);

  const existingLogsRef = useRef<LogDetect[]>(existingLogs);
  const isFirstLoadRef = useRef<boolean>(true);

  useEffect(() => {
    existingLogsRef.current = existingLogs;
  }, [existingLogs]);

  useEffect(() => {
    const fetchLogsAndUsers = async () => {
      try {
        // 1. Lấy Logs từ Redis Cache
        const fetchedLogs = await logService.getLogsCache(1000, 0);

        const currentLogs = existingLogsRef.current;

        if (!isFirstLoadRef.current) {
          const newLogs = fetchedLogs.filter(
            (newLog) =>
              !currentLogs.some((existing) => existing.id === newLog.id),
          );

          // Bắn thông báo đẩy cho các log mới có nhãn 'error' hoặc 'spam'
          newLogs.forEach((log) => {
            if (log.label === Label.ERROR) {
              notification.error({
                message: "Phát Hiện Lỗi",
                description: `Đơn hàng: ${log.orderId} - ${log.action}. Lý do: ${log.reason || "Lỗi logic hệ thống"}`,
                placement: "topRight",
                duration: 5,
              });
            } else if (log.label === Label.SPAM) {
              notification.warning({
                message: "Cảnh Báo Hành Vi Spam",
                description: `Tài khoản ${log.userID} spam hành động "${log.action}" trên đơn hàng ${log.orderId}.`,
                placement: "topRight",
                duration: 5,
              });
            }
          });
        }

        isFirstLoadRef.current = false;

        // Lưu danh sách logs vào Redux store
        dispatch(addLogs(fetchedLogs));

        // 2. Lấy danh sách blacklist Users từ Redis
        const fetchedUsers = await userService.getCachedUsers(1000, 0);
        dispatch(setUsers(fetchedUsers));
      } catch (error) {
        console.error(error);
      }
    };

    // Tải dữ liệu lần đầu tiên
    fetchLogsAndUsers();

    // Thiết lập chu kỳ polling cứ sau mỗi 2 giây
    const intervalId = setInterval(fetchLogsAndUsers, 2000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  // Tự động bắn 1 đơn hàng thành công mỗi 10 giây 
  // useEffect(() => {
  //   const autoGenerateLog = async () => {
  //     try {
  //       const result = await logService.generateNormalLog();
  //       if (result) {
  //         notification.success({
  //           message: "Đơn hàng thành công",
  //           description: `Đơn hàng đã hoàn thành (Bot)`,
  //           placement: "topRight",
  //           duration: 5,
  //         });
  //       }
  //     } catch (err) {
  //       console.error("Lỗi tự động tạo log thành công:", err);
  //     }
  //   };

  //   const intervalId = setInterval(autoGenerateLog, 20000);
  //   ; return () => clearInterval(intervalId);
  // }, []);
}
