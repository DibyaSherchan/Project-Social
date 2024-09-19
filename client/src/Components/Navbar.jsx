import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { MdOutlineLogin } from 'react-icons/md';
import { IoHome } from 'react-icons/io5';
import { IoMdNotifications } from 'react-icons/io';
import { IoIosSearch } from 'react-icons/io';
import { useUser } from '../UserContext';

const Navbar = () => {
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const overlayRef = useRef(null);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not logged in.');
      return;
    }

    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (!confirmLogout) return;

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleOverlay = () => setOverlayVisible(!isOverlayVisible);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleClickOutside = (e) => {
    if (overlayRef.current && !overlayRef.current.contains(e.target)) {
      setOverlayVisible(false);
    }
  };

  useEffect(() => {
    if (isOverlayVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
          <button onClick={toggleOverlay}>
            <IoIosSearch className="text-[28px] text-[#5c4033] hover:text-[#3e2723] transition" />
          </button>
          <NavLink to="#">
            <IoMdNotifications className="text-[28px] text-[#5c4033] hover:text-[#3e2723] transition" />
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
    </div>
  );
};

export default Navbar;
