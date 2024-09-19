import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useSelector, useDispatch } from "react-redux";
import { setPosts } from "../state";
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
  const token = useSelector((state) => state.token); // Fetch token from Redux state
  const user = useSelector((state) => state.user); // Fetch user from Redux state
  const [posts, setPostsState] = useState([]);
  const userId = user?._id; // Extract user ID from user object

  const fetchPosts = async () => {
    const response = await fetch("http://localhost:3001/posts", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }, // Use token from Redux state
    });
    const data = await response.json();
    setPostsState(data);
    dispatch(setPosts({ posts: data }));
  };

  useEffect(() => {
    if (token) {
      fetchPosts();
    }
  }, [token, dispatch]);

  const handleLike = async (postId) => {
    const response = await fetch(`http://localhost:3001/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`, // Use token from Redux state
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
      }),
    });
    const updatedPost = await response.json();
    setPostsState((prevPosts) =>
      prevPosts.map((post) =>
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  const handleComment = async (postId, comment) => {
    const response = await fetch(`http://localhost:3001/posts/${postId}/comment`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        comment,
      }),
    });
    const updatedPost = await response.json();
    setPostsState((prevPosts) =>
      prevPosts.map((post) =>
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  const handleAddFriend = async (friendId) => {
    const response = await fetch(`http://localhost:3001/users/${friendId}/add`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
      }),
    });
    const updatedUser = await response.json();
    dispatch(setUser(updatedUser)); // Assuming you have an action to update the user
  };

  const isFriend = (friendId) => {
    return user?.friends?.includes(friendId);
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
                  alt={post.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h2 className="text-xl font-semibold">{post.name}</h2>
                  <p className="text-gray-600">{post.location}</p>
                </div>
              </div>
              <img
                src={`http://localhost:3001/assets/${post.picturePath}`}
                alt="Post"
                className="w-full h-60 object-cover mb-4 rounded"
              />
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
              </div>
              <div className="mt-4">
                {post.comments.map((comment, index) => (
                  <div key={index} className="mb-2 p-2 bg-[#e0d6c5] rounded">
                    <p>{comment}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
