// Importing all the required modules
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

// Importing the routes
import { userRoutes } from "./routes/userRoutes.js";
import { videoRoutes } from "./routes/videoRoutes.js";
import { initiate } from "./GHL/initiate.js";
import { callback } from "./GHL/callback.js";
import { commRoutes } from "./routes/commRoutes.js";

// Configuring the environment variables
dotenv.config();
import cors from "cors";
import { loomSDKRoutes } from "./routes/loomSDK.js";
const PORT = process.env.PORT;

const MAX_RETRIES = 5; // Maximum number of retries
const RETRY_DELAY = 5000; // Delay between retries in milliseconds (5 seconds)

// Creating the express app
const app = express();

// Using the middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const allowedOrigins = [
  "https://recording-app-front-end.vercel.app",
  "https://recording-app-front-end.vercel.app/",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    // Allow any subdomain of .monday.app
    if (
      origin.endsWith(":5173") ||
      origin.endsWith("ngrok-free.app") ||
      origin.endsWith(".vercel.app") ||
      allowedOrigins.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Using the routes
app.use("/oauth/callback", callback);
app.use("/api/user", userRoutes);
app.use("/api/comms", commRoutes);
app.use("/init", initiate);
app.use("/api/video", videoRoutes);
app.use("/api/loom", loomSDKRoutes);

let retryCount = 0;

const connectWithRetry = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("Connected to MongoDB!");
      // Start the server only after successful DB connection
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      retryCount += 1;
      console.log(
        `Failed to connect to MongoDB (Attempt ${retryCount}/${MAX_RETRIES}):`,
        err
      );

      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying connection in ${RETRY_DELAY / 1000} seconds...`);
        setTimeout(connectWithRetry, RETRY_DELAY);
      } else {
        console.error("Max retries reached. Exiting...");
        process.exit(1); // Exit the process if retries are exhausted
      }
    });
};

// // Initial connection attempt

connectWithRetry();
