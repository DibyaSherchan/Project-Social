import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const data = new FormData();
      data.append("firstName", firstName);
      data.append("lastName", lastName);
      data.append("email", email);
      data.append("password", password);

      // Sending registration request
      const response = await axios.post(
        "http://localhost:3001/auth/register",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.error || "An error occurred during registration");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5f5dc]">
      <div className="bg-[#fdf2e9] border border-[#d8b892] p-10 rounded-lg shadow-lg w-full max-w-md vintage-texture">
        <h2 className="text-3xl font-bold text-center mb-6 font-serif text-[#3e2723]">Create Account</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label
              htmlFor="firstName"
              className="block text-[#6e5039] text-sm font-semibold mb-2 font-serif"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-3 border border-[#d8b892] rounded bg-[#f5f5dc] text-gray-800 font-serif focus:ring-2 focus:ring-[#b78c5b] focus:outline-none"
              placeholder="Enter your first name"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="lastName"
              className="block text-[#6e5039] text-sm font-semibold mb-2 font-serif"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-3 border border-[#d8b892] rounded bg-[#f5f5dc] text-gray-800 font-serif focus:ring-2 focus:ring-[#b78c5b] focus:outline-none"
              placeholder="Enter your last name"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-[#6e5039] text-sm font-semibold mb-2 font-serif"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-[#d8b892] rounded bg-[#f5f5dc] text-gray-800 font-serif focus:ring-2 focus:ring-[#b78c5b] focus:outline-none"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-[#6e5039] text-sm font-semibold mb-2 font-serif"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-[#d8b892] rounded bg-[#f5f5dc] text-gray-800 font-serif focus:ring-2 focus:ring-[#b78c5b] focus:outline-none"
              placeholder="Enter your password"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="confirm-password"
              className="block text-[#6e5039] text-sm font-semibold mb-2 font-serif"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm-password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 border border-[#d8b892] rounded bg-[#f5f5dc] text-gray-800 font-serif focus:ring-2 focus:ring-[#b78c5b] focus:outline-none"
              placeholder="Confirm your password"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-[#3e2723] hover:bg-[#5c4033] text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="bg-[#5c4033] hover:bg-[#3e2723] text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;