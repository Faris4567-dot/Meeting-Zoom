import React, { useState } from "react";
import { registerUser } from "../services/auth.service";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const nav = useNavigate();
  const [data, setData] = useState({ name: "", email: "", password: "" });

  async function submit(e) {
    e.preventDefault();

    if (!data.name || !data.email || !data.password) {
      alert("All fields are required");
      return;
    }

    try {
      await registerUser(data);
      alert("Registration successful! Please login.");
      nav("/login");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";
      alert(msg);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 mt-12 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Register</h2>

      <form onSubmit={submit} className="space-y-3">
        <input
          placeholder="Name"
          className="w-full p-2 border rounded"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
        <input
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded"
        >
          Register
        </button>
      </form>
    </div>
  );
}
