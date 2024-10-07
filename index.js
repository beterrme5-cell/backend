// Importing all the required modules
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

// Importing the routes
import { userRoutes } from "./routes/userRoutes.js";
import { videoRoutes } from "./routes/videoRoutes.js";

// Configuring the environment variables
dotenv.config();

// Creating the express app
const app = express();

// Using the middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// allowed cors origins
// const allowedOrigins = [
//   "http://localhost:5173", // Web Frontend
//   "http://192.168.18.72:8081", // Mobile Frontend
//   "https://192.168.18.92:8081", // Mobile Frontend
// ];

app.use(
  cors({
    // origin: (origin, callback) => {
    //   if (!origin || allowedOrigins.includes(origin)) {
    //     callback(null, true);
    //   } else {
    //     callback(new Error("Not allowed by CORS"));
    //   }
    // },
    origin: "*",
    credentials: true,
  })
);

// Using the routes
app.use("/api/user", userRoutes);
app.use("/api/video", videoRoutes);

// Connecting to the database and starting the server
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB!");
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log("Failed to connect to MongoDB:", err));
