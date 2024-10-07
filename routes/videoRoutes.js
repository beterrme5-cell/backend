import { Router } from "express";
import 
{ 
    saveNewVideo,
    updateVideo,
    deleteVideo,
    getVideosByAccountId
} 
from "../controllers/videoController.js";

export const videoRoutes = Router();

//Save a new video
videoRoutes.post("/saveNewVideo", saveNewVideo);

//Update a video
videoRoutes.put("/updateVideo", updateVideo);

//Delete a video
videoRoutes.delete("/deleteVideo/:id", deleteVideo);

//Get all videos by account id
videoRoutes.get("/getVideosByAccountId/:id", getVideosByAccountId);