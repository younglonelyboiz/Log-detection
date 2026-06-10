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
  stats: {
    suspended: number;
    spam: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  stats: {
    suspended: 0,
    spam: 0,
  },
  loading: false,
  error: null,
};

const updateStats = (state: UsersState) => {
  let suspendedCount = 0;
  let spamCount = 0;

  state.users.forEach((user) => {
    if (user.status === UserStatus.SUSPENDED) suspendedCount++;
    else if (user.status === UserStatus.SPAM) spamCount++;
  });

  state.stats = {
    suspended: suspendedCount,
    spam: spamCount,
  };
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
      updateStats(state);
    },
    updateUserStatus: (
      state,
      action: PayloadAction<{ id: string; status: User["status"] }>
    ) => {
      const { id, status } = action.payload;
      const user = state.users.find((u) => u.id === id);
      if (user) {
        user.status = status;
        updateStats(state);
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
