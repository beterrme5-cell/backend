import videoModel from "../models/videoModel.js";

// Save a new video
export const saveNewVideo = async (req, res) => 
{
    try {

        const { accountId, title, embeddedLink, shareableLink } = req.body;

        const video = await videoModel.create({ accountId, title, embeddedLink, shareableLink });

        return res.status(201).send({
            message: "Video saved successfully",
            video,
        });
    } 
    catch (error) 
    {
        res.status(500).json({ message: error.message });
    }
};

// Update a video
export const updateVideo = async (req, res) =>
{
    try {
        const { accountId, title, embeddedLink, shareableLink, videoId } = req.body;

        const video = await videoModel.findByIdAndUpdate(videoId, { accountId, title, embeddedLink, shareableLink }, { new: true });

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
        res.status(500).json({ message: error.message });
    }
}

// delete a video
export const deleteVideo = async (req, res) =>
{
    try {
        const { id } = req.params;
        const video = await videoModel.findByIdAndDelete(id);

        if (!video) {
            return res.status(404).send({
                message: "Video not found",
            });
        }

        return res.status(200).send({
            message: "Video deleted successfully",
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
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
        res.status(500).json({ message: error.message });
    }
}

