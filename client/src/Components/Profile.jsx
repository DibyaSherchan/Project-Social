import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [posts, setPosts] = useState([]);
  const [post, setPost] = useState("");
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  // Get the stored user object from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?._id; // Extract the user ID from the stored user object

  useEffect(() => {
    if (!userId) {
      alert("You are not logged in, you will be redirected to the login page.");
      navigate("/login");
      return;
    }

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
        alert("You are not logged in, you will be redirected to the login page.");
        navigate("/login");
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

    const fetchUserPosts = async () => {
      try {
        const postsResponse = await axios.get(
          `http://localhost:3001/posts/${userId}/posts`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setPosts(postsResponse.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchUserData();
    fetchUserFriends();
    fetchUserPosts();
  }, [userId, navigate]);

  if (!user) return <p>Loading...</p>;

  // Function to handle adding/removing a friend
  const handleFriendToggle = async (friendId) => {
    try {
      const response = await axios.patch(
        `http://localhost:3001/users/${userId}/${friendId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setFriends(response.data); // Update friends state with the new list
    } catch (error) {
      console.error("Error updating friends:", error);
    }
  };

  // Function to create a new post
  const handlePost = async () => {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("description", post);
    if (image) {
      formData.append("picture", image);
      formData.append("picturePath", image.name);
    }

    try {
      const response = await axios.post(
        `http://localhost:3001/posts`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Append the new post to the existing posts
      setPosts((prevPosts) => [response.data, ...prevPosts]);
      setImage(null);
      setPost("");
      window.location.reload();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:3001/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error.response ? error.response.data : error.message);
    }
  };

  const profilePictureUrl = user.profilePicture
    ? `http://localhost:3001/${user.profilePicture}`
    : "default-profile-pic.jpg";

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto p-6 bg-cream border border-brown-300 shadow-lg rounded-lg">
        <div className="flex items-center mb-6">
          <img
            src={profilePictureUrl}
            alt="Profile"
            className="w-24 h-24 rounded-full border-2 border-brown-600 mr-6"
          />
          <div className="text-brown-800">
            <h1 className="text-2xl font-bold">{`${user.firstName} ${user.lastName}`}</h1>
            <p className="text-brown-600 italic">{user.occupation}</p>
            <p className="text-brown-600">{user.location}</p>
            <p className="text-brown-600">
              {user.description || "No description available"}
            </p>
          </div>
          <div className="ml-auto flex">
            <button
              onClick={() => navigate(`/edit-profile/${userId}`)}
              className="bg-vintage-red hover:bg-dark-brown text-black font-bold py-2 px-4 rounded mx-2"
            >
              Edit Profile
            </button>
            <button
              onClick={() => navigate(`/`)}
              className="bg-vintage-red hover:bg-dark-brown text-black font-bold py-2 px-4 rounded"
            >
              Back
            </button>
          </div>
        </div>

        {/* Friends Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-brown-700 mb-4">Friends ({friends.length})</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {friends.map((friend) => (
              <li
                key={friend._id}
                className="flex items-center p-4 bg-brown-100 border border-brown-300 rounded-md"
              >
                <img
                  src={
                    `http://localhost:3001/assets/${friend.picturePath}` ||
                    "default-friend-pic.jpg"
                  }
                  alt={`${friend.firstName} ${friend.lastName}`}
                  className="w-12 h-12 rounded-full border-2 border-brown-600 mr-4"
                />
                <div className="text-brown-800">
                  <h3 className="text-lg font-bold">{`${friend.firstName} ${friend.lastName}`}</h3>
                  <p className="text-sm text-brown-600">{friend.occupation}</p>
                  <p className="text-sm text-brown-600">{friend.location}</p>
                </div>
                <button
                  onClick={() => handleFriendToggle(friend._id)} // Toggle friend status
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded ml-auto"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Post Creation Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-brown-700 mb-4">Create a Post</h2>
          <textarea
            value={post}
            onChange={(e) => setPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-2 border border-brown-400 rounded mb-2 bg-cream"
          />
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            className="mb-4"
          />
          <button
            onClick={handlePost}
            className="bg-yellow-700 hover:bg-dark-brown text-black font-bold py-2 px-4 rounded"
          >
            Post
          </button>
        </div>

        {/* Display User Posts */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-brown-700 mb-4">Your Posts</h2>
          {posts.map((post) => (
            <div key={post._id} className="mb-4 p-4 bg-brown-100 border border-brown-300 rounded-md">
              {post.picturePath && (
                <img
                  src={`http://localhost:3001/assets/${post.picturePath}`}
                  alt="Post"
                  className="mb-2"
                />
              )}
              <p>{post.description}</p>
              <button
                onClick={() => handleDeletePost(post._id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded mt-2"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Profile;