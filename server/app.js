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
import { Server } from "socket.io";
import http from "http";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import searchRoutes from "./routes/search.js"
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { updateUser } from './controllers/users.js';
import { verifyToken } from "./middleware/auth.js";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* CORS CONFIGURATION */
const corsOptions = {
  origin: 'http://localhost:5173', // Replace with your frontend URL
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

/* FILE STORAGE */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);
app.put('/users/:id', upload.single('picture'), updateUser);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use('/search', searchRoutes);

/* CREATE HTTP SERVER */
const server = http.createServer(app);

/* SOCKET.IO SETUP */
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
});
app.set('io', io);
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join', (userId) => {
    console.log(`User with ID ${userId} joined their room`);
    userSockets.set(userId, socket);
    socket.join(userId);
  });

  socket.on('like_post', ({ postOwnerId, likerId, postId }) => {
    const notification = {
      type: 'like',
      message: `User ${likerId} liked your post`,
      postId: postId
    };
    sendNotificationToUser(postOwnerId, notification);
  });

  socket.on('new_comment', (commentData) => {
    const { postOwnerId, commenterId, comment } = commentData;
    const notification = {
      type: 'comment',
      message: `User ${commenterId} commented: "${comment}"`,
      postId: commentData.postId
    };
    sendNotificationToUser(postOwnerId, notification);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    for (const [userId, userSocket] of userSockets.entries()) {
      if (userSocket === socket) {
        userSockets.delete(userId);
        break;
      }
    }
  });
});


export const sendNotificationToUser = (userId, notification) => {
  const userSocket = userSockets.get(userId);
  if (userSocket) {
    userSocket.emit('receive_notification', notification);
    console.log(`Notification sent to user ${userId}:`, notification);
  } else {
    console.log(`User ${userId} is not connected`);
  }
};

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 3001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
    
    /* ADD DATA ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts);
  })
  .catch((error) => console.log(`${error} did not connect`));

/* EXPORT THE SOCKET.IO INSTANCE */
export { io };