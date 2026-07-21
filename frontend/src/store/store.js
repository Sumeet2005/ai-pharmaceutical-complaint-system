import { configureStore } from "@reduxjs/toolkit";
import complaintReducer from "src/store/complaintSlice";
import dashboardReducer from "src/store/dashboardSlice";
import chatReducer from "src/store/chatSlice";

export const store = configureStore({
  reducer: {
    complaint: complaintReducer,
    dashboard: dashboardReducer,
    chat: chatReducer,
  },
});
