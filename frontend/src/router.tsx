import { useUser } from "@clerk/clerk-react"
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { SignInPage } from "./pages/sign-in";
import { SignUpPage } from "./pages/sign-up";
import SSOCallbackPage from "./pages/sso-callback";
import { Layout } from "./components/Layout";
import { Loader } from "./components/ui/loader";

function PublicRoute() {
  const { user, isLoaded } = useUser();
  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">
      <Loader size='lg' className="animate-spin" />
    </div>
  }

  if (user) {
    return <Navigate to="/library" />
  }

  return <><Outlet /></>
}

function ProtectedRoute() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">
      <Loader size='lg' className="animate-spin" />
    </div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  return <><Outlet /></>
}

export const router = createBrowserRouter([
  {
    Component: PublicRoute,
    children: [
      {
        path: "login",
        element: <SignInPage />
      },
      {
        path: "signup",
        element: <SignUpPage />
      },
      {
        path: "sso-callback",
        element: <SSOCallbackPage />
      }
    ]
  },
  {
    Component: ProtectedRoute,
    children: [{
      Component: Layout,
      children: [
        {
          index: true,
          element: <Navigate to="/library" />
        },
        {
          path: "library",
          element: <Dashboard />
        }
      ]
    }
    ]
  }
])