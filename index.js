// Importing all the required modules
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { importPKCS8, SignJWT } from "jose";
import fs from "fs";
// Configuring the environment variables
dotenv.config();
import cors from "cors";
const PORT = process.env.PORT;

// Importing the routes
import { userRoutes } from "./routes/userRoutes.js";
import { videoRoutes } from "./routes/videoRoutes.js";
import { initiate } from "./GHL/initiate.js";
import { callback } from "./GHL/callback.js";

const MAX_RETRIES = 5; // Maximum number of retries
const RETRY_DELAY = 5000; // Delay between retries in milliseconds (5 seconds)

const PRIVATE_PEM = fs.readFileSync(
  // "./konnected.u2Thi5o-BU.private-key.pem", // For Custom SDK
  "./recording-app.lGd-5+gulD.private-key.pem", // For Standard SDK
  "utf8"
);
// const PUBLIC_APP_ID = "d5dfdcdb-3445-443a-9fca-a61b0161a9ae"; // Public APP ID For Custom SDK
const PUBLIC_APP_ID = "06dbde78-c4db-449e-b09a-52a2e27aeeba"; // Public APP ID For Standard SDK

// Creating the express app
const app = express();

// Using the middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const allowedOrigins = ["https://c219-115-186-189-21.ngrok-free.app"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    // Allow any subdomain of .monday.app
    if (
      origin.endsWith(":5173") ||
      origin.endsWith("ngrok-free.app") ||
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
app.use("/api/video", videoRoutes);

// Generate JWT for Loom SDK
app.get("/get-loom-token", async (req, res) => {
  try {
    const privateKey = await importPKCS8(PRIVATE_PEM, "RS256");
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "RS256" })
      .setIssuedAt()
      .setIssuer(PUBLIC_APP_ID)
      .setExpirationTime("2m") // Token expires in 2 minutes
      .sign(privateKey);

    res.json({ token });
  } catch (error) {
    console.error("Error generating JWT:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

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
