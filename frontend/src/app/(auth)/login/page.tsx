'use client';

import React, {useState} from "react";
import '@/app/globals.css';

const MailIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
    />
  </svg>
);

const LockIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);


export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (response.ok) {
        window.location.href = "/";
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Login request failed:", err);
      setError("Login failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 font-sans p-4 bg-gradient-to-br from-orange-700 to-orange-200">
      <div className="w-full max-w-md p-8 space-y-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl animate-fade-in-up">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img src="logo.png" className="w-16 h-20" alt="" />
          </div>
          <h1 className="text-4xl font-bold text-orange-100 tracking-wider">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-orange-100">
            Sign in to continue your journey.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <MailIcon className="w-5 h-5 text-white/60" />
            </span>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full py-3 pl-10 pr-4 text-orange-100 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-white/60"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <LockIcon className="w-5 h-5 text-white/60" />
            </span>
            <input
              type="password"
              placeholder="Password"
              className="w-full py-3 pl-10 pr-4 text-orange-100 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-white/60"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end text-sm">
            <a
              href="#"
              className="font-medium text-orange-600 hover:text-orange-200 transition-colors"
            >
              Forgot Password?
            </a>
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 font-bold text-orange-100 bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg hover:from-orange-700 hover:to-orange-600 focus:outline-none focus:ring-4 focus:ring-purple-300/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>

        <p className="text-sm text-center text-orange-100">
          Don't have an account?{" "}
          <a
            href="/register"
            className="font-medium text-orange-600 hover:text-orange-200 focus:outline-none transition-colors"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

