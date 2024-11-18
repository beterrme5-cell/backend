import videoModel from "../models/videoModel.js";

// Save a new video
export const saveNewVideo = async (req, res) => 
{
    try {

        const { accountId, title, embeddedLink, shareableLink } = req.body;

        const video = await videoModel.create({ accountId, title, embeddedLink, shareableLink, description: "" });

        return res.status(201).send({
            message: "Video saved successfully",
            video,
        });
    } 
    catch (error) 
    {
        res.status(400).json({ message: error.message });
    }
};

// Update a video
export const updateVideo = async (req, res) =>
{
    try {
        const { accountId, title, videoId, description } = req.body;

        const video = await videoModel.findByIdAndUpdate(videoId, { accountId, title, description }, { new: true });

        if (!video) {
            return res.status(404).send({
                message: "Video not found",
            });
        }

        return res.status(200).send({
            message: "Video updated successfully",
            video,
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// delete a video
export const deleteVideo = async (req, res) =>
{
    try {
        const { accountId, videoId } = req.params;

        //Check if account id matches video account id
        const videoData = await videoModel.findById(videoId);
        if (videoData.accountId !== accountId) {
            return res.status(400).send({
                message: "You are not authorized to delete this video",
            });
        }
        const video = await videoModel.findByIdAndDelete(videoId);

        if (!video) {
            return res.status(400).send({
                message: "Video not found",
            });
        }

        return res.status(200).send({
            message: "Video deleted successfully",
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
    
}

// get all videos by account id
export const getVideosByAccountId = async (req, res) => {
    try {
        const { id } = req.params;
        const video = await videoModel.find({ accountId: id });

        res.status(200).send({
            message: "Videos retrieved successfully",
            video,
        })
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// get a video by id
export const getVideoById = async (req, res) => {
    try {
        const { id } = req.params;
        const video = await videoModel.findById(id);

        if (!video) {
            return res.status(404).send({
                message: "Video not found",
            });
        }

        res.status(200).send({
            message: "Video retrieved successfully",
            video,
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}

//get all videos
export const getAllVideos = async (req, res) => 
{
    try 
    {
        const videos = await videoModel.find();

        res.status(200).send({
            message: "Videos retrieved successfully",
            videos,
        });
    } 
    catch (error) 
    {
        res.status(400).json({ message: error.message });
    }
}

