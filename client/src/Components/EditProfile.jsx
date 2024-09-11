import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [description, setDescription] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setUser(response.data);
        setDescription(response.data.description || '');
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleProfilePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('description', description);
    if (profilePicture) {
      formData.append('picture', profilePicture); // Use the same key as used in backend multer setup
    }
  
    try {
      const response = await axios.put(`http://localhost:3001/users/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      localStorage.setItem('user', JSON.stringify(response.data)); // Save the updated user data
  
      alert('Profile updated successfully!');
      navigate(`/profile/${userId}?updated=true`);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating your profile.');
    }
  };
  
  
  if (!user) return <p>Loading...</p>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      <form onSubmit={handleFormSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Profile Picture
          </label>
          <input
            type="file"
            onChange={handleProfilePictureChange}
            className="border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            className="border rounded w-full py-2 px-3 text-gray-700"
            placeholder="Update your description"
            rows="4"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
