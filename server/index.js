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
import {register} from "./controllers/auth.js";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";
import { verify } from "crypto";
import {createPost} from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts} from "./data/index.js"

/* Configuration */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({limit : "30mb", extended: true}));
app.use(cors());
app.use("/assests", express.static(path.join(__dirname,'public/assets')));

/* File storage*/
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, "public/assets");
    },
    filename : function (req, file,cb){
        cb(null, file.originalname);
    }
});
const upload = multer({ storage}); 

/* ROUTES WITH FILES */
app.post("/auth/register",upload.single("picture"), register);
app.post("/posts", verifyToken,upload.single("picture"), createPost);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
/* mongoose setup */
//const mongoose = require('mongoose');
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    // Remove deprecated options
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // Add new option for server selection
    serverSelectionTimeoutMS: 5000 // Optional: Adjust timeout value as needed
  })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server Port : ${PORT}`));

    User.insertMany(users);
    Post.insertMany(posts);
  })
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// mongoose 
//     .connect(process.env.MONGO_URL, {
//         useNewUrlParser : true,
//         useUnifiedTopology : true,
//     })
//     .then(() => {
//         app.listen(PORT, () => console.log(`Server Port : ${PORT}`));
//     })
//     .catch((error) => console.log(`${error} did not connect`));