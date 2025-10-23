'use client';

import React from "react";
import "@/app/globals.css";

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

const UserIcon = ({ className = "w-6 h-6" }) => (
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
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);


export default function Register() {

    const handleSubmit=(event: React.FormEvent<HTMLFormElement>)=> {
        //call register api here
        event.preventDefault();
        window.location.href = "/login";
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 font-sans p-4 bg-gradient-to-br from-orange-200 to-orange-700">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl animate-fade-in-up">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img src="logo.png" className="w-16 h-20" alt="" />
          </div>
          <h1 className="text-4xl font-bold text-orange-100 tracking-wider">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-orange-100">
            Join our community today.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <UserIcon className="w-5 h-5 text-white/60" />
              </span>
              <input
                type="text"
                placeholder="First Name"
                className="w-full py-3 pl-10 pr-4 text-orange-100 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder-white/60"
                required
              />
            </div>
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <UserIcon className="w-5 h-5 text-white/60" />
              </span>
              <input
                type="text"
                placeholder="Last Name"
                className="w-full py-3 pl-10 pr-4 text-orange-100 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder-white/60"
                required
              />
            </div>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <MailIcon className="w-5 h-5 text-white/60" />
            </span>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full py-3 pl-10 pr-4 text-orange-100 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder-white/60"
              required
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <LockIcon className="w-5 h-5 text-white/60" />
            </span>
            <input
              type="password"
              placeholder="Password"
              className="w-full py-3 pl-10 pr-4 text-orange-100 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder-white/60"
              required
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <LockIcon className="w-5 h-5 text-white/60" />
            </span>
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full py-3 pl-10 pr-4 text-orange-100 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder-white/60"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              className="h-4 w-4 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
              required
            />
            <label
              htmlFor="consent"
              className="ml-3 block text-sm text-orange-100"
            >
              I accept the{" "}
              <a
                href="#"
                className="font-medium text-orange-600 hover:text-orange-200"
              >
                Terms and Conditions
              </a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg hover:from-orange-700 hover:to-orange-600 focus:outline-none focus:ring-4 focus:ring-purple-300/50 transition-all transform hover:scale-105"
            >
              Create Account
            </button>
          </div>
        </form>

        <p className="text-sm text-center text-gray-300">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-orange-600 hover:text-orange-200 focus:outline-none transition-colors"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
