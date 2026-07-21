import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  currentComplaint: null,
  status: "idle",
  error: null,
};

const complaintSlice = createSlice({
  name: "complaint",
  initialState,
  reducers: {},
});

export default complaintSlice.reducer;
