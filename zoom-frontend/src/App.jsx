// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MeetingRoom from "./pages/MeetingRoom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { getToken } from "./lib/storage";

function Private({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      {/* Top Navbar */}
      <Navbar />

      {/* Main container (grows, pushes footer down) */}
      <main className="flex-1 w-full">
        <div className="container mx-auto p-4">

          <Routes>
            {/* Redirect root → dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <Private>
                  <Dashboard />
                </Private>
              }
            />

            <Route
              path="/meeting/:id"
              element={
                <Private>
                  <MeetingRoom />
                </Private>
              }
            />
          </Routes>

        </div>
      </main>

      {/* Footer stays at bottom always */}
      <Footer />
    </div>
  );
}
