import api from "./api";
import { UserStatus } from "../enums/user-status.enum";

export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
}

export const userService = {
  getUsers: async (page: number = 1, pageSize: number = 100): Promise<User[]> => {
    const response = await api.get<User[]>("/users", {
      params: { page, pageSize },
    });
    return response.data;
  },

  getCachedUsers: async (limit: number = 100, offset: number = 0): Promise<User[]> => {
    const response = await api.get<User[]>("/users/cache", {
      params: { limit, offset },
    });
    return response.data;
  },

  updateUserStatus: async (id: string, status: User["status"]): Promise<any> => {
    const response = await api.patch(`/users/${id}/update`, { status });
    return response.data;
  },

  createUser: async (name: string, email: string): Promise<any> => {
    const response = await api.post("/create/users", { name, email });
    return response.data;
  },
};
