import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stats: {
    total: 0,
    pending: 0,
    resolved: 0,
    critical: 0,
  },
  recentComplaints: [],
  status: "idle",
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
});

export default dashboardSlice.reducer;
