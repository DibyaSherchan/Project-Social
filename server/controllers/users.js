import User from "../models/user.js";

//Read
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (s) {
    res.status(404).json({ message: s.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );
    res.status(200).json(formattedFriends);
  } catch (s) {
    res.status(404).json({ message: s.message });
  }
};

//Update
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((id) => id !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }
    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );

    res.status(200).json(formattedFriends)
  } catch (s) {
    res.status(404).json({ message: s.message });
  }
};

// Update user profile
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    // Debug logs
    console.log("Received file:", req.file); // This should show the file details
    console.log("Received description:", description);

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user description
    if (description) {
      user.description = description;
    }

    // Update profile picture if provided
    if (req.file) {
      // Replace backslashes with forward slashes and remove the 'public/' prefix
      user.profilePicture = req.file.path.replace(/\\/g, '/').replace('public/', '');
  }
  

    // Save updated user
    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: error.message });
  }
};
