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
videoRoutes.post("/saveNewVideo", saveNewVideo);

//Update a video
videoRoutes.put("/updateVideo", updateVideo);

//Delete a video
videoRoutes.delete("/deleteVideo/:accountId/:videoId", deleteVideo);

//Get all videos by account id
videoRoutes.get("/getVideosByAccountId/:id", getVideosByAccountId);

//Get all videos
videoRoutes.get("/getAllVideos", getAllVideos);

//Get video by id
videoRoutes.get("/getVideoById/:id", getVideoById);