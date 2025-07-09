import axios from "axios";
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
      companyId: user.companyId,
      userLocationId: user.userLocationId,
    });

    if (!userData) {
      return res.status(400).send({
        message: "User not found",
      });
    }

    // Delay the fetching of thumbnail URL by 15 seconds
    setTimeout(async () => {
      try {
        const fetchThumbnail = async () => {
          console.log("Fetching thumbnail URL...");
          const response = await fetchThumbnailURL(shareableLink);
          return response;
        };

        console.log("Shareable Link:", shareableLink);
        // Fetch the thumbnail URL after the delay
        const thumbnailURL = await fetchThumbnail();

        console.log("Thumbnail URL:", thumbnailURL);

        // Save the video after fetching the thumbnail
        const video = await videoModel.create({
          creator: userData._id,
          title,
          embeddedLink,
          shareableLink,
          description: "",
          thumbnailURL: thumbnailURL.thumbnail_url, // Use the fetched thumbnail URL
        });

        return res.status(201).send({
          message: "Video saved successfully",
          video,
        });
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }, 5000); // Delay the fetching of thumbnail URL by 2 seconds
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
      companyId: user.companyId,
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
      companyId: user.companyId,
      userLocationId: user.userLocationId,
    });
    if (!userData) {
      return res.status(400).send({
        message: "User not found",
      });
    }
    const recordedVideos = await videoModel.find({ creator: userData._id });

    const options = {
      method: "GET",
      url: "https://services.leadconnectorhq.com/medias/files",
      params: {
        sortBy: "createdAt",
        sortOrder: "asc",
        altType: "location",
        type: "file",
        altId: userData.userLocationId,
      },
      headers: {
        Authorization: `Bearer ${userData.accessToken}`,
        Version: "2021-07-28",
        Accept: "application/json",
      },
    };

    const { data } = await axios.request(options);
    let uploadedVideos = [];

    if (data && data.files) {
      uploadedVideos = data.files
        .filter((file) => file.contentType.startsWith("video"))
        .map((file) => ({
          title: file.name,
          description: "",
          embeddedLink: file.url,
          shareableLink: file.url,
          thumbnailURL: "",
          createdAt: file.createdAt,
          updatedAt: file.updatedAt,
        }));
    }

    res.status(200).send({
      message: "Videos retrieved successfully",
      recordedVideos,
      uploadedVideos,
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(400).json({ message: error.message });
  }
};

// get a video by id
export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await videoModel.findById(id);

    if (!video) {
      return res.status(400).send({
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
// export const getAllVideos = async (req, res) => {
//   try {
//     const videos = await videoModel.find();

//     res.status(200).send({
//       message: "Videos retrieved successfully",
//       videos,
//     });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// Updated backend controller with pagination
export const getAllVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const videos = await videoModel.find().skip(skip).limit(limit);
    const totalVideos = await videoModel.countDocuments();

    res.status(200).send({
      message: "Videos retrieved successfully",
      videos,
      currentPage: page,
      totalPages: Math.ceil(totalVideos / limit),
      totalVideos,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
