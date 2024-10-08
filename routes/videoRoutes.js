import { Router } from "express";
import 
{ 
    saveNewVideo,
    updateVideo,
    deleteVideo,
    getVideosByAccountId,
    getAllVideos
} 
from "../controllers/videoController.js";

//middlewares
import { authenticateToken } from "../middlewares/authenticateToken.js";

export const videoRoutes = Router();

//Save a new video
videoRoutes.post("/saveNewVideo", authenticateToken, saveNewVideo);

//Update a video
videoRoutes.put("/updateVideo", authenticateToken, updateVideo);

//Delete a video
videoRoutes.delete("/deleteVideo/:id", authenticateToken, deleteVideo);

//Get all videos by account id
videoRoutes.get("/getVideosByAccountId/:id", authenticateToken, getVideosByAccountId);

//Get all videos
videoRoutes.get("/getAllVideos", authenticateToken, getAllVideos);