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
      formData.append('picture', profilePicture);
    }

    try {
      const response = await axios.put(`http://localhost:3001/users/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      localStorage.setItem('user', JSON.stringify(response.data)); 

      alert('Profile updated successfully!');
      navigate(`/profile/${userId}?updated=true`);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating your profile.');
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-cream shadow-lg border border-brown-300 rounded-lg">
      <h1 className="text-2xl font-bold text-brown-800 mb-6">Edit Profile</h1>
      <form onSubmit={handleFormSubmit}>
        <div className="mb-6">
          <label className="block text-brown-800 font-bold mb-2">
            Profile Picture
          </label>
          <input
            type="file"
            onChange={handleProfilePictureChange}
            className="border border-brown-400 bg-cream text-brown-800 rounded w-full py-2 px-3"
          />
        </div>
        <div className="mb-6">
          <label className="block text-brown-800 font-bold mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            className="border border-brown-400 bg-cream text-brown-800 rounded w-full py-2 px-3"
            placeholder="Update your description"
            rows="4"
          />
        </div>
        <button
          type="submit"
          className="bg-yellow-700 hover:bg-dark-brown text-white font-bold py-2 px-4 rounded"
        >
          Save Changes
        </button>
        <button
          className="bg-yellow-700 hover:bg-dark-brown text-white font-bold py-2 px-4 rounded ml-6"
          onClick={()=>{
            navigate('/')
          }}
        >
          Back
        </button>
      </form>
    </div>
  );
};

export default EditProfile;