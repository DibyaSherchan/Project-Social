import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const Profile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();
  
  // Fetch user data and friends
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get(
          `http://localhost:3001/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUser(userResponse.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        alert('You are not logged in, you will be redirected to the login page.');
        navigate('/login'); // Redirect to the login page
      }
    };

    const fetchUserFriends = async () => {
      try {
        const friendsResponse = await axios.get(
          `http://localhost:3001/users/${userId}/friends`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setFriends(friendsResponse.data);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchUserData();
    fetchUserFriends();
  }, [userId, navigate]);

  // Check if user data is loaded
  if (!user) return <p>Loading...</p>;

  // Construct profile picture URL
  const profilePictureUrl = user.profilePicture
    ? `http://localhost:3001/${user.profilePicture}`
    : "default-profile-pic.jpg";

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <div className="flex items-center mb-6">
        <img 
          src={profilePictureUrl} 
          alt="Profile" 
          className="w-24 h-24 rounded-full mr-6"
        />
        <div>
          <h1 className="text-2xl font-bold">{`${user.firstName} ${user.lastName}`}</h1>
          <p className="text-gray-600">{user.occupation}</p>
          <p className="text-gray-600">{user.location}</p>
          <p className="text-gray-600">
            {user.description || "No description available"}
          </p>
        </div>
        <button
          onClick={() => navigate(`/edit-profile/${userId}`)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Edit Profile
        </button>
        <button
          onClick={() => navigate(`/`)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-10"
        >
          Back
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Friends ({friends.length})</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {friends.map((friend) => (
            <li
              key={friend._id}
              className="flex items-center p-4 bg-gray-100 rounded-md"
            >
              <img
                src={
                  `http://localhost:3001/assets/${friend.picturePath}` ||
                  "default-friend-pic.jpg"
                }
                alt={`${friend.firstName} ${friend.lastName}`}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h3 className="text-lg font-bold">{`${friend.firstName} ${friend.lastName}`}</h3>
                <p className="text-sm text-gray-600">{friend.occupation}</p>
                <p className="text-sm text-gray-600">{friend.location}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Profile;
