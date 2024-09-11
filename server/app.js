import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import postRoutes from "./routes/posts.js";
import createPost from "./controllers/posts.js"
import { register } from "./controllers/auth.js";
import { updateUser } from './controllers/users.js';
import { verifyToken } from "./middleware/auth.js";
import User from "./models/user.js";
import Post from "./models/post.js";
import {users, posts} from "./data/index.js"

// OtherLines
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({limit: "30mb", extended: true}));
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname,'public/uploads')));

// Multer storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads'); // Ensure this path exists or create it
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

// Routes with files
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

// Corrected PUT route for updating user
app.put('/users/:id', upload.single('picture'), updateUser);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

// Mongoose Connection 
const PORT = process.env.PORT || 6001;
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=>{
    app.listen(PORT,()=>console.log(`Server Port: ${PORT}`));
    // Only Once
    User.insertMany(users);
    Post.insertMany(posts);
})
.catch((error)=>console.log(`${error} did not connect`));
