import React, { useState } from "react";
import { loginUser } from "../services/auth.service";
import { saveTokens } from "../lib/storage";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e) {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email & password");
      return;
    }

    try {
      const res = await loginUser({ email, password });
      saveTokens(res.data);
      nav("/dashboard");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again.";

      alert(msg);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 mt-12 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Login</h2>

      <form onSubmit={submit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}
