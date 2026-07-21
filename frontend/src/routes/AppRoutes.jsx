import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "src/layouts/MainLayout";
import Complaint from "src/pages/Complaint";
import Dashboard from "src/pages/Dashboard";
import Home from "src/pages/Home";
import NotFound from "src/pages/NotFound";
import { ROUTES } from "src/utils/constants/routes";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.COMPLAINT_INTAKE} element={<Complaint />} />
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
