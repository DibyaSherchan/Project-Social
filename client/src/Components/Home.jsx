import React, { useEffect, useState } from "react";
import { io } from "socket.io-client"; // Import Socket.IO client
import Navbar from "./Navbar";
import { useDispatch } from "react-redux";
import { setPosts, setFriends } from "../state";
import {
  AiOutlineLike,
  AiFillLike,
  AiOutlineComment,
  AiOutlineShareAlt,
  AiOutlineUserAdd,
  AiOutlineUserDelete,
} from "react-icons/ai";

const Home = () => {
  const dispatch = useDispatch();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [posts, setPostsState] = useState([]);
  const [socket, setSocket] = useState(null); // Socket.IO state
  const userId = user?._id;

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
  }, []);

  // Connect to Socket.IO when component mounts
  useEffect(() => {
    if (userId) {
      const newSocket = io("http://localhost:3001", {
        query: { userId },
      });
      setSocket(newSocket);

      // Listen for notification events
      newSocket.on("receive_notification", (notification) => {
        alert(notification.message); // Display notification (could be improved)
      });

      // Cleanup on component unmount
      return () => newSocket.disconnect();
    }
  }, [userId]);

  const fetchPosts = async () => {
    if (!token) return;

    const response = await fetch("http://localhost:3001/posts", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setPostsState(data);
    dispatch(setPosts({ posts: data }));
  };

  useEffect(() => {
    if (token) {
      fetchPosts();
    }
  }, [token]);

  const handleLike = async (postId) => {
    try {
      console.log("Attempting to like post with ID:", postId);
      const response = await fetch(`http://localhost:3001/posts/${postId}/like`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
  
      const updatedPost = await response.json();
      setPostsState((prevPosts) =>
        prevPosts.map((post) =>
          post._id === updatedPost._id ? updatedPost : post
        )
      );
  
      // Emit notification after liking the post
      if (socket) {
        socket.emit("like_post", {
          postOwnerId: updatedPost.userId,
          likerId: userId,
          postId,
        });
      }
    } catch (error) {
      console.error("Error liking post:", error);
      // Handle the error appropriately (e.g., show a user-friendly message)
    }
  };
  

  const handleComment = async (postId, comment) => {
    const response = await fetch(`http://localhost:3001/posts/${postId}/comment`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, comment }),
    });
    const updatedPost = await response.json();
    setPostsState((prevPosts) =>
      prevPosts.map((post) =>
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };
  
  const handleAddFriend = async (friendId) => {
    const userId = user?._id; // Ensure you're getting the latest userId
    console.log("User ID:", userId);
    
    try {
      const response = await fetch(`http://localhost:3001/users/${userId}/${friendId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error response:", errorResponse);
        throw new Error("Failed to add friend");
      }
  
      const updatedUser = await response.json();
      console.log("Updated User:", updatedUser);
      
      // Update the user state and friends list without refreshing
      setUser((prevUser) => ({
        ...prevUser,
        friends: updatedUser.friends,
      }));
      localStorage.setItem("user", JSON.stringify(updatedUser));
      dispatch(setFriends({ friends: updatedUser.friends }));
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };
  
  const isFriend = (friendId) => {
    if (!user || !Array.isArray(user.friends)) {
      return false;
    }
    return user.friends.includes(friendId);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f5e8d3] flex flex-col items-center p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-8 text-[#5c4033]">
            {user ? `Welcome, ${user.firstName}!` : "Welcome to our site!"}
          </h1>
        </div>
        <div className="w-full max-w-4xl bg-[#c3a087] p-6 rounded-lg shadow-lg text-[#3e2723]">
          {posts.map((post) => (
            <div
              key={post._id}
              className="mb-6 p-4 bg-white rounded-lg shadow-md"
            >
              <div className="flex items-center mb-4">
                <img
                  src={`http://localhost:3001/assets/${post.userPicturePath}`}
                  alt={post.firstName}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h2 className="text-xl font-semibold">{post.firstName} {post.lastName}</h2>
                  <p className="text-gray-600">{post.location}</p>
                </div>
              </div>
              {post.picturePath && (
                <img
                  src={`http://localhost:3001/assets/${post.picturePath}`}
                  alt="Post"
                  className="w-full h-[500px] object-cover mb-4 rounded"
                />
              )}
              <p className="mb-4">{post.description}</p>
              <div className="flex items-center mb-4 space-x-4">
                <button
                  onClick={() => handleLike(post._id)}
                  className="text-[#5c4033] hover:text-[#3e2723] flex items-center"
                >
                  {post.likes[userId] ? (
                    <AiFillLike size={24} className="mr-2" />
                  ) : (
                    <AiOutlineLike size={24} className="mr-2" />
                  )}
                  {Object.keys(post.likes).length} Likes
                </button>
                <button
                  onClick={() =>
                    handleComment(post._id, prompt("Enter your comment:"))
                  }
                  className="text-[#5c4033] hover:text-[#3e2723] flex items-center"
                >
                  <AiOutlineComment size={24} className="mr-2" />
                  Comment
                </button>
                <button className="text-[#5c4033] hover:text-[#3e2723] flex items-center">
                  <AiOutlineShareAlt size={24} className="mr-2" />
                  Share
                </button>
                {post.userId !== userId && (
                  <button
                    onClick={() => handleAddFriend(post.userId)}
                    className="text-[#5c4033] hover:text-[#3e2723] flex items-center"
                  >
                    {isFriend(post.userId) ? (
                      <AiOutlineUserDelete size={24} className="mr-2" />
                    ) : (
                      <AiOutlineUserAdd size={24} className="mr-2" />
                    )}
                    {isFriend(post.userId) ? "Remove Friend" : "Add Friend"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
