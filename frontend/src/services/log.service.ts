import api from "./api";
import { Label } from "../enums/label.enum";

export interface LogDetect {
  id?: string;
  orderId: string;
  action: string;
  userID: string;
  timestamp: string;
  label: Label;
  reason?: string;
}

export interface RawLog {
  id: string;
  orderId: string;
  action: string;
  userID: string;
  timestamp: string;
  isDetected: boolean;
}

export const logService = {
  getLogsCache: async (limit: number = 50, offset: number = 0): Promise<LogDetect[]> => {
    const response = await api.get<LogDetect[]>("/logs/cache", {
      params: { limit, offset },
    });
    return response.data;
  },

  getLogsByUser: async (userId: string): Promise<RawLog[]> => {
    const response = await api.get<RawLog[]>(`/logs/user/${userId}`);
    return response.data;
  },

  getDetectedLogsByUser: async (userId: string): Promise<LogDetect[]> => {
    const response = await api.get<LogDetect[]>(`/logs/detected/user/${userId}`);
    return response.data;
  },

  generateNormalLog: async (): Promise<any> => {
    const response = await api.post("/logs/normal");
    return response.data;
  },

  generateErrorLog: async (quantity: number): Promise<any> => {
    const response = await api.post("/logs/error", { quantity });
    return response.data;
  },

  generateSpamLog: async (action: string, quantity: number): Promise<any> => {
    const response = await api.post("/logs/spam", { action, quantity });
    return response.data;
  },
};
