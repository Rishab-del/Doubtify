import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Home from "./components/Home/Home";
import Dashboard from "./components/Dashboard/Dashboard";
import Features from "./components/Features/Features";
import Login from "./components/Login/Login";

import MyDoubts from "./components/Home/Offcanvas/MyDoubts";
import Notes from "./components/Home/Offcanvas/Notes";
import Progress from "./components/Home/Offcanvas/Progress";
import Profile from "./components/Home/Offcanvas/Profile";
import Settings from "./components/Home/Offcanvas/Settings";

import Splash from "./components/Splash/Splash";
import Plans from "./components/Plans/Plans";
import Offcanvas from "./components/Home/Offcanvas/Offcanvas";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AIOptions from "./components/Dashboard/AIOptions";
import AIchat from "./components/Dashboard/AIchat";
import Discussion from "./components/Dashboard/Discussion";
import Signup from "./components/Login/signup";
import CalendarPage from "./components/Home/Offcanvas/Calender";

import PrivateRoute from "./components/PrivateRoute";

import "./App.css";

function Layout() {
  const location = useLocation();

  const hideSidebarRoutes = [
    "/",
    "/login",
    "/signup",
    "/home",
    "/features",
    "/plans",
  ];

  return (
    <>
      {!hideSidebarRoutes.includes(location.pathname) && <Offcanvas />}

      <Routes>
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/plans" element={<Plans />} />

        <Route
          path="/my-doubts"
          element={
            <PrivateRoute>
              <MyDoubts />
            </PrivateRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <PrivateRoute>
              <Notes />
            </PrivateRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <PrivateRoute>
              <Progress />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/ai-options"
          element={
            <PrivateRoute>
              <AIOptions />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/aichat"
          element={
            <PrivateRoute>
              <AIchat />
            </PrivateRoute>
          }
        />
        <Route path="/dashboard/discussion" element={
            <PrivateRoute>
              <Discussion />
            </PrivateRoute>
          }
        />
        <Route path="/calender" element={<Calender />} />

        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
      />

      <BrowserRouter>
        <Layout />
      </BrowserRouter>

      <footer className="footer">
        <p>&copy; 2024 Doubtify. All rights reserved.</p>
      </footer>
    </>
  );
}

export default App;
