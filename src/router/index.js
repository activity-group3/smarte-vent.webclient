import { useRoutes } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ErrorPage from "../pages/Error";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import ActivityDetail from "../pages/ActivityDetail";
import MyActivities from "../pages/MyActivities";
import MyParticipant from "../pages/MyParticipant";
import DashboardLayout from "../layouts/DashboardLayout";

// Define the Router as a React component
function Router() {
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
          path: "/my-participant",
          element: <MyParticipant />,
          errorElement: <ErrorPage />,
        },
      ],
    },
    {
      path: "*",
      element: <ErrorPage />,
    },
  ]);

  return routes;
}

export default Router;
