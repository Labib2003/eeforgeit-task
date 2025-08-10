import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import DashboardLayout from "./pages/DashboardLayout.tsx";
import Login from "./pages/Login.tsx";
import { Toaster } from "sonner";
import Questions from "./pages/Questions.tsx";
import ConfigPage from "./pages/Config.tsx";
import UsersPage from "./pages/Users.tsx";
import EvaluatePage from "./pages/Evaluate.tsx";
import SubmissionsPage from "./pages/Submissions.tsx";

const accessToken = localStorage.getItem("access_token");

const router = createBrowserRouter([
  {
    path: "/",
    element: accessToken ? <Navigate to={"/dashboard"} /> : <Login />,
  },
  {
    path: "/dashboard",
    element: accessToken ? <DashboardLayout /> : <Navigate to={"/"} />,
    children: [
      { index: true, element: <ConfigPage /> },
      { path: "questions", element: <Questions /> },
      { path: "users", element: <UsersPage /> },
      { path: "evaluate", element: <EvaluatePage /> },
      { path: "submissions", element: <SubmissionsPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster />
  </StrictMode>,
);
