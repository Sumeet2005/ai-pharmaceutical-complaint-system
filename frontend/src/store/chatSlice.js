import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  status: "idle",
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {},
});

export default chatSlice.reducer;
