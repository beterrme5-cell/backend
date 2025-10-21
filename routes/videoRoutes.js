import { Router } from "express";
import {
  saveNewVideo,
  updateVideo,
  deleteVideo,
  getVideosByAccountId,
  getAllVideos,
  getVideoById,
  getPresignedUrl,
  saveCustomNewVideo,
  updateCustomNewVideo,
} from "../controllers/videoController.js";

//middlewares
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { verifyAccessToken } from "../middlewares/refreshAccessToken.js";

export const videoRoutes = Router();

//Save a new video
videoRoutes.post("/saveNewVideo", authenticateToken, saveNewVideo);

//Update a video
videoRoutes.put("/updateVideo", authenticateToken, updateVideo);

//Delete a video
videoRoutes.delete("/deleteVideo/:videoId", authenticateToken, deleteVideo);

//Get all videos by account id
videoRoutes.get(
  "/getVideosByAccountId",
  authenticateToken,
  verifyAccessToken,
  getVideosByAccountId
);

//Get all videos
videoRoutes.get("/getAllVideos", authenticateToken, getAllVideos);

//Get video by id
videoRoutes.get("/getVideoById/:id", authenticateToken, getVideoById);

//get presisgned url for video upload to aws
videoRoutes.post("/getSignedUrl", getPresignedUrl);

//Save a new custom video
videoRoutes.post("/saveCustomNewVideo", authenticateToken, saveCustomNewVideo);

videoRoutes.post("/updateCustomNewVideo", updateCustomNewVideo);
