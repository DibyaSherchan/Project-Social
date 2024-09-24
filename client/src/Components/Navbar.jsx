import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { IoPersonCircleOutline, IoHome, IoSearch } from "react-icons/io5"; 
import { MdOutlineLogin, MdNotifications } from "react-icons/md"; 
import { useUser } from "../UserContext";
import { IoIosTrendingUp } from "react-icons/io";
import io from "socket.io-client";

const Navbar = ({ notifications, setNotifications }) => {
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isNotificationModalVisible, setNotificationModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const overlayRef = useRef(null);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

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

  const handleAddFriend = async (friendId) => {
    const token = localStorage.getItem("token");
    const userId = user?._id;

    if (!userId || !token) {
      alert("You must be logged in to add friends.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/users/${userId}/${friendId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error response:", errorResponse);
        throw new Error("Failed to add friend");
      }

      const updatedUser = await response.json();
      console.log("Updated User:", updatedUser);

      setUser((prevUser) => ({
        ...prevUser,
        friends: updatedUser.friends,
      }));
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Update the search results to reflect the new friend status
      setSearchResults(prevResults => ({
        ...prevResults,
        users: prevResults.users.map(u => 
          u._id === friendId ? { ...u, isFriend: true } : u
        )
      }));

    } catch (error) {
      console.error("Error adding friend:", error);
      alert("Failed to add friend. Please try again.");
    }
  };

  const isFriend = (friendId) => {
    if (!user || !Array.isArray(user.friends)) {
      return false;
    }
    return user.friends.includes(friendId);
  };

  const renderNotification = (notification) => {
    switch (notification.type) {
      case "like":
      case "comment":
        return (
          <li key={notification._id} className="mb-2 p-2 bg-white rounded">
            {notification.message}
          </li>
        );
      default:
        return null;
    }
  };

  const toggleOverlay = () => setOverlayVisible(!isOverlayVisible);
  const toggleNotificationModal = () => setNotificationModalVisible(!isNotificationModalVisible);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

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

  const handleSearchSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    if (!searchQuery) return;

    try {
      const response = await fetch(`http://localhost:3001/search?query=${searchQuery}`);
      const data = await response.json();
      setSearchResults(data); // Assuming data contains both users and posts
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  return (
    <div className="bg-[#c3a087] shadow-md py-4 px-8">
      <div className="flex items-center justify-between">
        <div className="text-3xl font-semibold text-[#5c4033]">VintageNav</div>
        <div className="flex items-center gap-8">
          <NavLink to="/">
            <IoHome className="text-[28px] text-[#5c4033] hover:text-[#3e2723] transition" />
          </NavLink>
          
          <button onClick={toggleNotificationModal} className="relative">
            <MdNotifications className="text-[28px] text-[#5c4033] hover:text-[#3e2723] transition" />
            {notifications.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          <button onClick={toggleOverlay} className="relative">
            <IoSearch className="text-[28px] text-[#5c4033] hover:text-[#3e2723] transition" />
          </button>

          <NavLink to={`/trending`}>
              <IoIosTrendingUp className="text-[28px] text-[#5c4033] hover:text-[#3e2723] transition" />
            </NavLink>

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

      {isNotificationModalVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#f5e8d3] p-6 rounded shadow-md w-full max-w-md relative">
            <button
              onClick={toggleNotificationModal}
              className="absolute top-4 right-4 text-[#5c4033] hover:text-[#3e2723]"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-[#5c4033]">Notifications</h2>
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
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <IoSearch className="text-[#5c4033] mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-[#5c4033] leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter search term"
              />
              <button type="submit" className="ml-2 bg-[#5c4033] text-white py-2 px-4 rounded">
                Search
              </button>
            </form>

            {searchResults.users.length > 0 || searchResults.posts.length > 0 ? (
              <div className="mt-4">
                <h3 className="font-bold mb-2">Results:</h3>
                <ul className="bg-white rounded shadow-md">
                  {searchResults.users.map(user => (
                    <li key={user._id} className="p-2 border-b flex items-center justify-between">
                      <div className="flex items-center">
                        <img 
                          src={`http://localhost:3001/assets/${user.picturePath}`} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-full mr-2"
                        />
                        <NavLink to={`/profile/${user._id}`} className="text-[#5c4033] hover:underline">
                          {user.name}
                        </NavLink>
                      </div>
                      <button 
                        onClick={() => handleAddFriend(user._id)}
                        className="bg-[#5c4033] text-white py-1 px-2 rounded text-sm"
                      >
                        Add Friend
                      </button>
                    </li>
                  ))}
                  {searchResults.posts.map(post => (
                    <li key={post._id} className="p-2 border-b">
                      <NavLink to={`/post/${post._id}`} className="text-[#5c4033] hover:underline">
                        <div className="flex items-center">
                          <img 
                            src={`http://localhost:3001/assets/${post.picturePath}`} 
                            alt="Post" 
                            className="w-10 h-10 object-cover mr-2"
                          />
                          <div>
                            <p className="font-semibold">{post.userId.name}</p>
                            <p className="text-sm">{post.description}</p>
                          </div>
                        </div>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              searchQuery && <div className="mt-4 text-gray-600">No results found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
