import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Label } from "../enums/label.enum";

export interface LogDetect {
  id: string;
  orderId: string;
  action: string;
  userID: string;
  timestamp: string;
  label: Label;
  reason: string;
}

interface LogsState {
  logs: LogDetect[];
  stats: {
    total: number;
    normal: number;
    error: number;
    spam: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: LogsState = {
  logs: [],
  stats: {
    total: 0,
    normal: 0,
    error: 0,
    spam: 0,
  },
  loading: false,
  error: null,
};
const updateStats = (state: LogsState) => {
  let normal = 0;
  let errorCount = 0;
  let spam = 0;

  state.logs.forEach((log) => {
    if (log.label === Label.NORMAL) normal++;
    else if (log.label === Label.ERROR) errorCount++;
    else if (log.label === Label.SPAM) spam++;
  });

  state.stats = {
    total: state.logs.length,
    normal,
    error: errorCount,
    spam,
  };
};

const logsSlice = createSlice({
  name: "logs",
  initialState,
  reducers: {
    setLogs: (state, action: PayloadAction<LogDetect[]>) => {
      state.logs = action.payload;
      updateStats(state);
    },
    addLogs: (state, action: PayloadAction<LogDetect[]>) => {
      const newLogs = action.payload.filter(
        (newLog) => !state.logs.some((existing) => existing.id === newLog.id),
      );

      if (newLogs.length > 0) {
        const combinedLogs = [...state.logs, ...newLogs];
        state.logs = combinedLogs.slice(0, 200);

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

export const { setLogs, addLogs, setLoading, setError } = logsSlice.actions;
export default logsSlice.reducer;
