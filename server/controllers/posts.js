import Post from "../models/post.js";
import User from "../models/user.js";
import Notification from "../models/notification.js";
import { sendNotificationToUser } from "../app.js";

/* CREATE */
export const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath } = req.body;
    const user = await User.findById(userId);
    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      likes: {},
      comments: [],
    });
    await newPost.save();

    const post = await Post.find();
    res.status(201).json(post);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    const post = await Post.find();
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.find({ userId });
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* Like Post */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await post.save();

    // Create a notification if the post is liked (not unliked) and it's not the user's own post
    if (!isLiked && post.userId.toString() !== userId) {
      const notification = new Notification({
        userId: post.userId,
        type: 'like',
        message: `User ${userId} liked your post`,
        relatedId: id,
      });
      await notification.save();

      const io = req.app.get('io');
      if (io) {
        sendNotificationToUser(post.userId.toString(), {
          type: 'like',
          message: `User ${userId} liked your post`,
          postId: id,
        });
      }
    }

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* Comment on Post */
export const commentOnPost = async (req, res) => {
  try {
    const { id } = req.params; // Post ID
    const { comment } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Add the comment
    post.comments.push({ userId, comment });
    const updatedPost = await post.save();

    // Create a notification for the post owner if it's not their own post
    if (post.userId.toString() !== userId) {
      const notification = new Notification({
        userId: post.userId,
        type: 'comment',
        message: `User ${userId} commented on your post`,
        relatedId: id,
      });
      await notification.save();

      const io = req.app.get('io');
      if (io) {
        sendNotificationToUser(post.userId.toString(), {
          type: 'comment',
          message: `User ${userId} commented on your post`,
          postId: id,
        });
      }
    }

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* Share Post */
export const sharePost = async (req, res) => {
  try {
    const { id } = req.params; // Post ID
    const userId = req.user.id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Assuming the logic for sharing involves creating a new post or some other action
    const sharedPost = new Post({
      userId,
      description: post.description,
      picturePath: post.picturePath,
      shared: true,
    });
    await sharedPost.save();

    // Notify the original post's owner if it's not the user's own post
    if (post.userId.toString() !== userId) {
      const notification = new Notification({
        userId: post.userId,
        type: 'share',
        message: `User ${userId} shared your post`,
        relatedId: id,
      });
      await notification.save();

      const io = req.app.get('io');
      if (io) {
        sendNotificationToUser(post.userId.toString(), {
          type: 'share',
          message: `User ${userId} shared your post`,
          postId: id,
        });
      }
    }

    res.status(200).json(sharedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* Delete Post */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
