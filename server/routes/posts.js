import express from "express";
import { 
  getFeedPosts, 
  getUserPosts, 
  likePost, 
  deletePost, 
  commentOnPost, // New import for commenting
  sharePost      // New import for sharing
} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId/posts", verifyToken, getUserPosts);

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);
router.patch("/:id/comment", verifyToken, commentOnPost);  // New route for commenting
router.patch("/:id/share", verifyToken, sharePost);        // New route for sharing

/* DELETE */
router.delete("/:id", verifyToken, deletePost);  // Route remains the same

export default router;
