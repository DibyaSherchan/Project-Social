// UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user')); // Access the entire user object
      const userId = storedUser ? storedUser._id : null; // Extract _id from the user object
      console.log('Retrieved userId (_id):', userId); // Log the retrieved userId

      if (!userId) {
        console.error('User ID (_id) not found in localStorage');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3001/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
