import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import PDFViewer from "./PDFViewer";

import "./App.css";

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
      />
      <BrowserRouter>
        <Offcanvas />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Splash />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/features" element={<Features />} />
          <Route path="/plans" element={<Plans />} />

          <Route path="/my-doubts" element={<MyDoubts />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="/dashboard/ai-options" element={<AIOptions />} />
          <Route path="/dashboard/aichat" element={<AIchat />} />
          <Route path="/dashboard/discussion" element={<Discussion />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pdf" element={<PDFViewer />} />
        </Routes>
      </BrowserRouter>
      <footer className="footer">
        <p>&copy; 2024 Doubtify. All rights reserved.</p>
      </footer>
    </>
  );
}

export default App;
