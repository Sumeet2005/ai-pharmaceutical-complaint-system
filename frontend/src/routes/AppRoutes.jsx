import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "src/layouts/MainLayout";
import Complaint from "src/pages/Complaint";
import Dashboard from "src/pages/Dashboard";
import ComplaintDetails from "src/pages/ComplaintDetails";
import Home from "src/pages/Home";
import HomeDashboard from "src/pages/HomeDashboard";
import NotFound from "src/pages/NotFound";
import { ROUTES } from "src/utils/constants/routes";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page - Outside layout wrappers */}
        <Route path={ROUTES.LANDING} element={<Home />} />

        {/* Enterprise QMS Application Pages - Wrapped in sidebar layout */}
        <Route element={<MainLayout />}>
          <Route path={ROUTES.HOME} element={<HomeDashboard />} />
          <Route path={ROUTES.COMPLAINT_INTAKE} element={<Complaint />} />
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.COMPLAINT_DETAILS} element={<ComplaintDetails />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
