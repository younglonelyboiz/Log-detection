import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserStatus } from "../enums/user-status.enum";

export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
}

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    updateUserStatus: (
      state,
      action: PayloadAction<{ id: string; status: User["status"] }>
    ) => {
      const { id, status } = action.payload;
      const user = state.users.find((u) => u.id === id);
      if (user) {
        user.status = status;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setUsers, updateUserStatus, setLoading, setError } = usersSlice.actions;
export default usersSlice.reducer;
