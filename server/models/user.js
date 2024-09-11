import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 50,
        },
        lastName: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 50,
        },
        email: {
            type: String,
            required: true,
            maxlength: 50,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 5,
        },
        profilePicture: { // Updated field name from picturePath to profilePicture
            type: String,
            default: "",
        },
        description: { // Added description field for the profile
            type: String,
            default: "",
        },
        friends: {
            type: Array,
            default: [],
        },
        location: String,
        occupation: String,
        viewedProfile: {
            type: Number,
            default: 0,
        },
        impressions: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
