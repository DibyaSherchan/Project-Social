import express from "express";
import{
    getUser,
    getUserFriends,
    addRemoveFriend,
    getNotifications 
}from"../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";
import { updateUser } from '../controllers/users.js'; // Ensure this controller handles updates correctly
import multer from 'multer';
const router = express.Router();
const upload = multer({ storage: multer.diskStorage({ 
  destination: (req, file, cb) => cb(null, 'public/assets'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname) 
}) });

// Route to update user profile with image upload
router.put('/:id', upload.single('profilePicture'), async (req, res) => {
  const { description } = req.body;
  const profilePicture = req.file ? req.file.filename : null; // Store the filename

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        description: description || '', 
        ...(profilePicture && { picturePath: profilePicture }), // Update only if a picture is provided
      },
      { new: true }
    );

    res.json(updatedUser); // Return the updated user object
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Error updating profile');
  }
});

//Read
router.get("/:id",verifyToken,getUser);
router.get("/:id/friends",verifyToken, getUserFriends);
router.get("/:userId/notifications", verifyToken, getNotifications);

//Update
router.patch("/:id/:friendId",verifyToken, addRemoveFriend);

router.put('/:id', upload.single('profilePicture'), updateUser);

export default router;