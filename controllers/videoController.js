import videoModel from "../models/videoModel.js";
import userModel from "../models/userModel.js";
import { fetchThumbnailURL } from "../services/fetchThumbnailURL.js";

// Save a new video
export const saveNewVideo = async (req, res) => {
  try {
    const { title, embeddedLink, shareableLink } = req.body;
    const user = req.user;

    const userData = await userModel.findOne({
      accountId: user.accountId,
      userLocationId: user.userLocationId,
    });
    if (!userData) {
      return res.status(400).send({
        message: "User not found",
      });
    }

    // Fetch the thumbnail URL
    const thumbnailURLResponse = await fetchThumbnailURL(shareableLink);

    const video = await videoModel.create({
      creator: userData._id,
      title,
      embeddedLink,
      shareableLink,
      description: "",
      thumbnailURL: thumbnailURLResponse.thumbnail_url,
    });

    return res.status(201).send({
      message: "Video saved successfully",
      video,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a video
export const updateVideo = async (req, res) => {
  try {
    const { title, videoId, description } = req.body;

    const video = await videoModel.findByIdAndUpdate(
      videoId,
      { title, description },
      { new: true }
    );

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
};

// delete a video
export const deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const user = req.user;

    const userData = await userModel.findOne({
      accountId: user.accountId,
      userLocationId: user.userLocationId,
    });
    if (!userData) {
      return res.status(400).send({
        message: "User not found",
      });
    }

    const videoData = await videoModel.findById(videoId);
    if (videoData.creator.toString() !== userData._id.toString()) {
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
};

// get all videos by account id
export const getVideosByAccountId = async (req, res) => {
  try {
    const user = req.user;

    const userData = await userModel.findOne({
      accountId: user.accountId,
      userLocationId: user.userLocationId,
    });
    if (!userData) {
      return res.status(400).send({
        message: "User not found",
      });
    }
    const videos = await videoModel.find({ creator: userData._id });

    res.status(200).send({
      message: "Videos retrieved successfully",
      videos,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

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
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//get all videos
export const getAllVideos = async (req, res) => {
  try {
    const videos = await videoModel.find();

    res.status(200).send({
      message: "Videos retrieved successfully",
      videos,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
