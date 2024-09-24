// App.jsx
import React from 'react';
import Home from "./Components/Home";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Profile from "./Components/Profile";
import { Routes, Route } from "react-router-dom";
import { UserProvider } from './UserContext'; // Import UserProvider
import EditProfile from './Components/EditProfile'; // Import the new component
import Trending from "./Components/Trending"

const App = () => {
  return ( 
    <div className="app"> 
      <UserProvider> {/* Wrap with UserProvider */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/edit-profile/:userId" element={<EditProfile />} /> {/* New route */}
          <Route path="/trending" element={<Trending />} />
        </Routes>
      </UserProvider>
    </div>
  );
};

export default App;