import React from "react";
import { useRoutes, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ErrorPage from "../pages/Error";
import Home from "../pages/Home";
import Dashboard from "../pages/user/Dashboard";
import ActivityDetail from "../pages/user/ActivityDetail";
import MyActivities from "../pages/user/MyActivities";
import MyParticipant from "../pages/user/MyParticipant";
import DashboardLayout from "../layouts/StudentLayout";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/Dashboard";
import CreateActivity from "../pages/admin/CreateActivity";
import AdminActivityDetail from "../pages/admin/ActivityDetail";
import AdminParticipantManage from "../pages/admin/Participant-Management";
import AdminAccountManage from "../pages/admin/Account-Management";
import AdminActivityManage from "../pages/admin/Activity-Management";
import CreateAccount from "../pages/admin/CreateAccount";
import MyContributorActivity from "../pages/user/Manage-Contribution";
import ParticipantManage from "../pages/user/Participant-Management";
import OrganizationLayout from "../layouts/OrganizationLayout";
import OrganizationActivityManagement from "../pages/Organization/ActivityManagement";
import OrganizationCreateActivity from "../pages/Organization/CreateActivity";
import OrganizationInformation from "../pages/Organization/Information";
import OrganizationList from "../pages/Organization/OrganizationList";
import OrganizationAnalysis from "../pages/Organization/Analysis";
import OrganizationDashboard from "../pages/Organization/Dashboard";
import OrganizationParticipantManagement from "../pages/Organization/ParticipantManagement";
import OrganizationActivityDetail from "../pages/Organization/ActivityDetail";
import StudentAnalysis from "../pages/user/Analysis";
import { useRoleAuth } from "../hooks/useAuth";

const Router: React.FC = () => {
  const { checkAdminRole, checkOrganizationRole } = useRoleAuth();
  
  const routes = useRoutes([
    {
      path: "/",
      element: <Home />,
      errorElement: <ErrorPage />,
    },
    {
      path: "/auth",
      children: [
        {
          path: "login",
          element: <Login />,
          errorElement: <ErrorPage />,
        },
        {
          path: "register",
          element: <Register />,
          errorElement: <ErrorPage />,
        },
      ],
    },
    {
      element: <DashboardLayout />,
      children: [
        {
          path: "/dashboard",
          element: <Dashboard />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/my-activities",
          element: <MyActivities />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/activities/:id",
          element: <ActivityDetail />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/my-participation",
          element: <MyParticipant />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/my-activities/contributor",
          element: <MyContributorActivity />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/activity/:id/verify/",
          element: <ParticipantManage />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/organizations",
          element: <OrganizationList />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/my-analysis",
          element: <StudentAnalysis />,
          errorElement: <ErrorPage />,
        },
      ],
    },
    {
      element: checkAdminRole() ? (
        <AdminLayout />
      ) : (
        <Navigate to="/dashboard" />
      ),
      children: [
        {
          path: "/admin/dashboard",
          element: <AdminDashboard />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/admin/activities/create",
          element: <CreateActivity />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/admin/activities/:id",
          element: <AdminActivityDetail />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/admin/activities/:id/participants",
          element: <AdminParticipantManage />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/admin/accounts",
          element: <AdminAccountManage />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/admin/activities",
          element: <AdminActivityManage />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/admin/create-account",
          element: <CreateAccount />,
          errorElement: <ErrorPage />,
        },
      ],
    },
    {
      element: checkOrganizationRole() ? (
        <OrganizationLayout />
      ) : (
        <Navigate to="/dashboard" />
      ),
      children: [
        {
          path: "/organization/dashboard",
          element: <OrganizationDashboard />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/organization/activities/:id",
          element: <OrganizationActivityDetail />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/organization/activities",
          element: <OrganizationActivityManagement />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/organization/activities/create",
          element: <OrganizationCreateActivity />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/organization/activities/:id/participants",
          element: <OrganizationParticipantManagement />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/organization/:id/information",
          element: <OrganizationInformation />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/organization/analysis",
          element: <OrganizationAnalysis />,
          errorElement: <ErrorPage />,
        },
      ],
    },
    // Keep the catch-all route at the end
    {
      path: "*",
      element: <ErrorPage />,
    },
  ]);

  return routes;
};

export default Router;
