import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { complaintApi } from "../api/complaintApi";

export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const data = await complaintApi.getComplaints();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch dashboard complaints.");
    }
  }
);

export const reviewComplaint = createAsyncThunk(
  "dashboard/reviewComplaint",
  async (id, { rejectWithValue }) => {
    try {
      // Explicitly PATCH the status to Reviewed to avoid empty payloads
      const data = await complaintApi.updateComplaint(id, { status: "Reviewed" });
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to review complaint.");
    }
  }
);

export const deleteComplaint = createAsyncThunk(
  "dashboard/deleteComplaint",
  async (id, { rejectWithValue }) => {
    try {
      await complaintApi.deleteComplaint(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete complaint.");
    }
  }
);

const initialState = {
  complaints: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch data cases
      .addCase(fetchDashboardData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.complaints = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Review complaint cases
      .addCase(reviewComplaint.fulfilled, (state, action) => {
        const index = state.complaints.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.complaints[index] = action.payload;
        }
      })
      // Delete complaint cases
      .addCase(deleteComplaint.fulfilled, (state, action) => {
        state.complaints = state.complaints.filter((c) => c.id !== action.payload);
      });
  },
});

export default dashboardSlice.reducer;
