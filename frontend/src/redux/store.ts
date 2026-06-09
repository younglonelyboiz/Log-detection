import { configureStore } from "@reduxjs/toolkit";
import logsReducer from "./logsSlice";
import usersReducer from "./usersSlice";

export const store = configureStore({
  reducer: {
    logs: logsReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
