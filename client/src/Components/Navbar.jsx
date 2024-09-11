import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { MdOutlineLogin } from 'react-icons/md';
import { IoHome } from 'react-icons/io5';
import { IoMdNotifications } from 'react-icons/io';
import { IoIosSearch } from 'react-icons/io';
import { useUser } from '../UserContext'; // Import useUser hook from context

const Navbar = () => {
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const overlayRef = useRef(null);
  const { user } = useUser(); // Access user from context
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is logged in by checking for the token
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('You are not logged in.');
      return;
    }

    // Prompt the user to confirm logout
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (!confirmLogout) {
      return; // Exit if the user cancels the logout
    }

    // Clear token and user data from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Redirect to login page
    navigate('/login'); // Using `navigate` instead of `window.location.href`
  };

  const toggleOverlay = () => {
    setOverlayVisible(!isOverlayVisible);
  };

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
      // Add event listener for clicks outside the overlay
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      // Remove event listener when overlay is not visible
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      // Cleanup event listener on component unmount
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOverlayVisible]);

  return (
    <div>
      <div className="flex items-center justify-center gap-10 h-20 bg-gray-300">
        <div>
          <NavLink to="/">
            <IoHome className="text-[30px]" />
          </NavLink>
        </div>
        <div>
          <button onClick={toggleOverlay}>
            <IoIosSearch className="text-[30px] mt-2" />
          </button>
        </div>
        <div>
          <NavLink to="#">
            <IoMdNotifications className="text-[30px]" />
          </NavLink>
        </div>
        <div>
          {user && user._id ? (
            <NavLink to={`/profile/${user._id}`}>
              <IoPersonCircleOutline className="text-[30px]" />
            </NavLink>
          ) : (
            <NavLink to="/login">
              <IoPersonCircleOutline className="text-[30px]" />
            </NavLink>
          )}
        </div>
        {!isLoggedIn ? (
          <div>
            <NavLink to="/login">
              <MdOutlineLogin className="text-[30px]" />
            </NavLink>
          </div>
        ) : (
          <div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {isOverlayVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={overlayRef}
            className="bg-white p-6 rounded shadow-md w-full max-w-md relative"
          >
            <button
              onClick={toggleOverlay}
              className="absolute top-4 right-4 text-gray-700 hover:text-gray-900"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Search</h2>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter search term"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
