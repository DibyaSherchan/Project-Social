import User from '../models/user.js'; // Adjust the path to your User model
import Post from '../models/post.js'; // Adjust the path to your Post model

// Search function
export const search = async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ message: "Query parameter is required." });
  }

  try {
    // Search in Users and Posts
    const users = await User.find({ name: { $regex: query, $options: 'i' } }).limit(10); // Case-insensitive search
    const posts = await Post.find({ description: { $regex: query, $options: 'i' } }).limit(10); // Case-insensitive search

    return res.status(200).json({ users, posts });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
