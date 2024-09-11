import React from "react";
import Navbar from "./Navbar";

const Home = () => {
  // Retrieve user data from local storage
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center bg-gray-300">
        <div className="">
          <h1 className="text-4xl font-bold text-center">
            {user ? `Welcome, ${user.firstName}!` : "Welcome to our site!"}
          </h1>
        </div>
      </div>
    </>
  );
};

export default Home;
