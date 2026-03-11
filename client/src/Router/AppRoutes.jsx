import React from "react";
import { Route, Routes } from "react-router-dom";
import Signin from "../pages/Signin";
import Signup from "../pages/Signup";
import Homepage from "../pages/Homepage";
import Dashboard from "../pages/Dashboard/Dashboard";
import HabitTrack from "../pages/HabitTrack";
import ProtectedRoute from "./ProtectedRoute";
import Dashboardlayout from "../pages/Dashboard/components/Dashboardlayout";
import Profile from "../pages/Profile";
import Analytics from "../pages/Analytics";
import AnalyticsMonth from "../pages/AnalyticsMonth";

import Loading from "../components/Loading";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route index element={<Homepage />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboardlayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="habittrack" element={<HabitTrack />} />
          <Route path="profile" element={<Profile />} />
          <Route path="loading" element={<Loading />} />
          <Route path="analytics" element={<Analytics />} />
          <Route
            path="analytics/:year/:month/:tab?"
            element={<AnalyticsMonth />}
          />
        </Route>
      </Routes>
    </>
  );
};

export default AppRoutes;
