import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearTokens, getToken } from "../lib/storage";

export default function Navbar() {
  const nav = useNavigate();
  const logged = !!getToken();

  function logout() {
    clearTokens();
    nav("/login");
  }

  return (
    <nav className="bg-white shadow mb-4">
      <div className="container mx-auto p-4 flex justify-between">
        <Link to="/" className="font-bold text-xl">Meetings</Link>

        {logged ? (
          <button onClick={logout} className="text-red-600">Logout</button>
        ) : (
          <div>
            <Link to="/login" className="mr-3">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
