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
import { userAuthVerification } from "../middlewares/userAuthVerification.js";

export const videoRoutes = Router();

//Save a new video
videoRoutes.post("/saveNewVideo", userAuthVerification,  saveNewVideo);

//Update a video
videoRoutes.put("/updateVideo", userAuthVerification, updateVideo);

//Delete a video
videoRoutes.delete("/deleteVideo/:accountId/:videoId", userAuthVerification, deleteVideo);

//Get all videos by account id
videoRoutes.get("/getVideosByAccountId/:id", userAuthVerification, getVideosByAccountId);

//Get all videos
videoRoutes.get("/getAllVideos", userAuthVerification, getAllVideos);

//Get video by id
videoRoutes.get("/getVideoById/:id", userAuthVerification, getVideoById);