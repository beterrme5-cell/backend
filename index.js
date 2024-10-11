// Importing all the required modules
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
const MAX_RETRIES = 5; // Maximum number of retries
const RETRY_DELAY = 5000; // Delay between retries in milliseconds (5 seconds)

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


let retryCount = 0;

const connectWithRetry = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("Connected to MongoDB!");
      // Start the server only after successful DB connection
      app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
      });
    })
    .catch((err) => {
      retryCount += 1;
      console.log(`Failed to connect to MongoDB (Attempt ${retryCount}/${MAX_RETRIES}):`, err);

      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying connection in ${RETRY_DELAY / 1000} seconds...`);
        setTimeout(connectWithRetry, RETRY_DELAY);
      } else {
        console.error("Max retries reached. Exiting...");
        process.exit(1); // Exit the process if retries are exhausted
      }
    });
};

// Initial connection attempt
connectWithRetry();