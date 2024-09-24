import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { IoPersonCircleOutline } from "react-icons/io5";
import { MdOutlineLogin } from "react-icons/md";
import { IoHome } from "react-icons/io5";
import { IoMdNotifications } from "react-icons/io";
import { useUser } from "../UserContext";
import io from "socket.io-client"; // Import Socket.IO client

const Navbar = ({ notifications, setNotifications }) => {
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isNotificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const overlayRef = useRef(null);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Initialize the socket connection
    if (user && user._id) {
      const newSocket = io("http://localhost:3001", { withCredentials: true });

      newSocket.emit("join", user._id);

      newSocket.on("receive_notification", (notification) => {
        setNotifications((prevNotifications) => [
          notification,
          ...prevNotifications,
        ]);
      });

      return () => newSocket.disconnect();
    }
  }, [user, setNotifications]);

  const handleLogout = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not logged in.");
      return;
    }

    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderNotification = (notification) => {
    switch (notification.type) {
      case "like":
        return (
          <li key={notification._id} className="mb-2 p-2 bg-white rounded">
            {notification.message}
          </li>
        );
      // Add more cases for different notification types if needed
      default:
        return null;
    }
  };

  const toggleOverlay = () => setOverlayVisible(!isOverlayVisible);
  const toggleNotificationModal = () =>
    setNotificationModalVisible(!isNotificationModalVisible); // Toggle notification modal

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleClickOutside = (e) => {
    if (overlayRef.current && !overlayRef.current.contains(e.target)) {
      setOverlayVisible(false);
    }
  };

  useEffect(() => {
    if (isOverlayVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOverlayVisible]);

  return (
    <div className="bg-[#c3a087] shadow-md py-4 px-8">
      <div className="flex items-center justify-between">
        <div className="text-3xl font-semibold text-[#5c4033]">VintageNav</div>
        <div className="flex items-center gap-8">
          <NavLink to="/">
            <IoHome className="text-[28px] text-[#5c4033] hover:text-[#3e2723] transition" />
          </NavLink>
          <button onClick={toggleNotificationModal} className="relative">
            <IoMdNotifications className="text-[28px] text-[#5c4033] hover:text-[#3e2723] transition" />
            {notifications.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
          {user && user._id ? (
            <NavLink to={`/profile/${user._id}`}>
              <IoPersonCircleOutline className="text-[28px] text-[#5c4033] hover:text-[#3e2723] transition" />
            </NavLink>
          ) : (
            <NavLink to="/login">
              <IoPersonCircleOutline className="text-[28px] text-[#5c4033] hover:text-[#3e2723] transition" />
            </NavLink>
          )}
          {!isLoggedIn ? (
            <NavLink to="/login">
              <MdOutlineLogin className="text-[28px] text-[#5c4033] hover:text-[#3e2723] transition" />
            </NavLink>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-[#f5e8d3] text-[#5c4033] hover:bg-[#5c4033] hover:text-[#f5e8d3] font-bold py-2 px-4 rounded transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {isOverlayVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={overlayRef}
            className="bg-[#f5e8d3] p-6 rounded shadow-md w-full max-w-md relative"
          >
            <button
              onClick={toggleOverlay}
              className="absolute top-4 right-4 text-[#5c4033] hover:text-[#3e2723]"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-[#5c4033]">Search</h2>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-[#5c4033] leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter search term"
            />
          </div>
        </div>
      )}

      {isNotificationModalVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#f5e8d3] p-6 rounded shadow-md w-full max-w-md relative">
            <button
              onClick={toggleNotificationModal}
              className="absolute top-4 right-4 text-[#5c4033] hover:text-[#3e2723]"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-[#5c4033]">
              Notifications
            </h2>
            <ul>
              {notifications.length === 0 ? (
                <li className="text-gray-600">No new notifications.</li>
              ) : (
                notifications.map(renderNotification)
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
