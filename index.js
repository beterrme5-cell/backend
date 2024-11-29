// Importing all the required modules
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
// import { importPKCS8, SignJWT } from "jose";
import * as jose from "jose";
import fs from "fs";

// Importing the routes
import { userRoutes } from "./routes/userRoutes.js";
import { videoRoutes } from "./routes/videoRoutes.js";
import { initiate } from "./GHL/initiate.js";
import { callback } from "./GHL/callback.js";
import { commRoutes } from "./routes/commRoutes.js";

// Configuring the environment variables
dotenv.config();
import cors from "cors";
const PORT = process.env.PORT;

const MAX_RETRIES = 5; // Maximum number of retries
const RETRY_DELAY = 5000; // Delay between retries in milliseconds (5 seconds)
const LOOM_SDK_APP_ID = process.env.LOOM_SDK_APP_ID;

// Creating the express app
const app = express();

// Using the middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const allowedOrigins = ["https://recording-app-front-end.vercel.app"];

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

// Generate JWT for Loom SDK
app.get("/setup", async (_, res) => {
  // const PRIVATE_PEM = fs.readFileSync("./konnectd.9+W34lVHx+.private-key.pem", {
  //   encoding: "utf8",
  // });

  const privateKey = process.env.PEM_FILE_KEY.replace(/\\n/g, "\n");

  // Load private key from PEM
  const pk = await jose.importPKCS8(privateKey, "RS256");

  // Construct and sign JWS
  let jws = await new jose.SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt()
    .setIssuer(LOOM_SDK_APP_ID)
    .setExpirationTime("2h")
    .sign(pk);

  console.log(jws);

  // Write content to client and end the response
  return res.json({ token: jws });
});

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
