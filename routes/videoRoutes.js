import { Router } from "express";
import 
{ 
    saveNewVideo,
    updateVideo,
    deleteVideo,
    getVideosByAccountId,
    getAllVideos,
    getVideoById
} 
from "../controllers/videoController.js";

//middlewares
import { authenticateToken } from "../middlewares/authenticateToken.js";

export const videoRoutes = Router();

//Save a new video
videoRoutes.post("/saveNewVideo", authenticateToken,  saveNewVideo);

//Update a video
videoRoutes.put("/updateVideo", authenticateToken, updateVideo);

//Delete a video
videoRoutes.delete("/deleteVideo/:accountId/:videoId", authenticateToken, deleteVideo);

//Get all videos by account id
videoRoutes.get("/getVideosByAccountId", authenticateToken, getVideosByAccountId);

//Get all videos
videoRoutes.get("/getAllVideos", authenticateToken, getAllVideos);

//Get video by id
videoRoutes.get("/getVideoById/:id", authenticateToken, getVideoById);