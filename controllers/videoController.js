import axios from "axios";
import videoModel from "../models/videoModel.js";
import userModel from "../models/userModel.js";
import { fetchThumbnailURL } from "../services/fetchThumbnailURL.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

import dotenv from "dotenv";
dotenv.config();

// ⚙️ Create S3 client
const s3 = new S3Client({
  region: "us-east-2", // Change to your region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Store in .env
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

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
// export const getVideosByAccountId = async (req, res) => {
//   try {
//     const user = req.user;

//     const userData = await userModel.findOne({
//       accountId: user.accountId,
//       companyId: user.companyId,
//       userLocationId: user.userLocationId,
//     });
//     if (!userData) {
//       return res.status(400).send({
//         message: "User not found",
//       });
//     }
//     const recordedVideos = await videoModel.find({ creator: userData._id });

//     const options = {
//       method: "GET",
//       url: "https://services.leadconnectorhq.com/medias/files",
//       params: {
//         sortBy: "createdAt",
//         sortOrder: "asc",
//         altType: "location",
//         type: "file",
//         altId: userData.userLocationId,
//       },
//       headers: {
//         Authorization: `Bearer ${userData.accessToken}`,
//         Version: "2021-07-28",
//         Accept: "application/json",
//       },
//     };

//     const { data } = await axios.request(options);
//     let uploadedVideos = [];

//     if (data && data.files) {
//       uploadedVideos = data.files
//         .filter((file) => file.contentType.startsWith("video"))
//         .map((file) => ({
//           title: file.name,
//           description: "",
//           embeddedLink: file.url,
//           shareableLink: file.url,
//           thumbnailURL: "",
//           createdAt: file.createdAt,
//           updatedAt: file.updatedAt,
//         }));
//     }

//     res.status(200).send({
//       message: "Videos retrieved successfully",
//       recordedVideos,
//       uploadedVideos,
//     });
//   } catch (error) {
//     console.error("Error fetching videos:", error);
//     res.status(400).json({ message: error.message });
//   }
// };

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

//get video viewer data

// ✅ FIX: Get video viewer data (you had req.params instead of req.query)
export const getVideoViewer = async (req, res) => {
  try {
    const { id } = req.query; // ✅ Changed from req.params to req.query

    const video = await videoModel.findById(id); // ✅ Use dynamic id instead of hardcoded

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

// ✅ NEW: Increment video view count
export const incrementVideoView = async (req, res) => {
  try {
    const { videoId } = req.body;

    const video = await videoModel.findById(videoId);

    if (!video) {
      return res.status(404).send({
        message: "Video not found",
      });
    }

    // Increment view count
    video.viewCount = (video.viewCount || 0) + 1;
    await video.save();

    res.status(200).send({
      message: "View count incremented successfully",
      viewCount: video.viewCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

// export const getAllVideos = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     // Get ALL videos sorted by newest first (important for pagination)
//     const allVideos = await videoModel
//       .find()
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const totalVideos = await videoModel.countDocuments();

//     // Separate into recorded/uploaded (frontend expects this structure)
//     const recordedVideos = allVideos.filter((v) => !v.uploaded);
//     const uploadedVideos = allVideos.filter((v) => v.uploaded);

//     res.status(200).send({
//       message: "Videos retrieved successfully",
//       recordedVideos,
//       uploadedVideos,
//       currentPage: page,
//       totalPages: Math.ceil(totalVideos / limit),
//       totalVideos,
//       pagination: {
//         recorded: {
//           currentPage: page,
//           totalPages: Math.ceil(totalVideos / limit),
//           totalVideos: totalVideos,
//         },
//         uploaded: {
//           currentPage: page,
//           totalPages: Math.ceil(totalVideos / limit),
//           totalVideos: totalVideos,
//         },
//       },
//     });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

export const getVideosByAccountId = async (req, res) => {
  try {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find user data
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

    // Get recorded videos with pagination
    const recordedVideos = await videoModel
      .find({ creator: userData._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalRecordedVideos = await videoModel.countDocuments({
      creator: userData._id,
    });

    // Get uploaded videos from API
    const options = {
      method: "GET",
      url: "https://services.leadconnectorhq.com/medias/files",
      params: {
        sortBy: "createdAt",
        sortOrder: "desc", // Changed to desc to match recorded videos sorting
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
    let allUploadedVideos = [];

    if (data && data.files) {
      allUploadedVideos = data.files
        .filter((file) => file.contentType.startsWith("video"))
        .map((file) => ({
          title: file.name,
          description: "",
          embeddedLink: file.url,
          shareableLink: file.url,
          thumbnailURL: "",
          createdAt: file.createdAt,
          updatedAt: file.updatedAt,
          uploaded: true, // Adding this to match the other function's structure
        }));
    }

    // Apply pagination to uploaded videos (since API doesn't support pagination, we'll do it client-side)
    const totalUploadedVideos = allUploadedVideos.length;
    const uploadedVideos = allUploadedVideos.slice(skip, skip + limit);

    res.status(200).send({
      message: "Videos retrieved successfully",
      recordedVideos,
      uploadedVideos,
      currentPage: page,
      totalPages: {
        recorded: Math.ceil(totalRecordedVideos / limit),
        uploaded: Math.ceil(totalUploadedVideos / limit),
      },
      totalVideos: {
        recorded: totalRecordedVideos,
        uploaded: totalUploadedVideos,
      },
      pagination: {
        recorded: {
          currentPage: page,
          totalPages: Math.ceil(totalRecordedVideos / limit),
          totalVideos: totalRecordedVideos,
        },
        uploaded: {
          currentPage: page,
          totalPages: Math.ceil(totalUploadedVideos / limit),
          totalVideos: totalUploadedVideos,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getPresignedUrl = async (req, res) => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res
        .status(400)
        .json({ message: "fileName and fileType required" });
    }

    const uniqueFileName = `recordings/${uuidv4()}.webm`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: fileType,
    });

    //  Generate URL valid for 5 minutes
    const url = await getSignedUrl(s3, command, { expiresIn: 300 });

    res.status(200).send({
      message: "Presigned Url generated Successfully",
      url,
      key: uniqueFileName, //  helps to store video path later
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save a new custom video
export const saveCustomNewVideo = async (req, res) => {
  try {
    const { title, key, duration, size } = req.body;

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

    // Save the video after fetching the thumbnail
    const video = await videoModel.create({
      creator: userData._id,
      title: title,
      videoKey: key,
      duration: duration,
      size: size,
      description: "",
      thumbnailKey: "", // empty for now
      teaserKey: "", // empty for now
      gifKey: "", // empty for now
      eventProcessed: false, // optional since it's default
    });

    return res.status(201).send({
      message: "Video saved successfully",
      video,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// // Update a custom video
// export const updateCustomNewVideo = async (req, res) => {
//   try {
//     // Destructure the S3 keys from the request body
//     const { videoKey, thumbnailKey, gifKey, teaserKey } = req.body;

//     console.log("🎥 Received S3 keys:");
//     console.log("Video:", videoKey);
//     if (thumbnailKey) console.log("Thumbnail:", thumbnailKey); // NEW: Only log if provided
//     if (gifKey) console.log("GIF:", gifKey);
//     if (teaserKey) console.log("Teaser:", teaserKey);

//     // Validate input
//     if (!videoKey) {
//       return res.status(400).json({ message: "videoKey is required" });
//     }

//     // NEW: Build update fields only for provided keys (partial update, no overwriting to "")
//     const updateFields = {};
//     if (thumbnailKey !== undefined) updateFields.thumbnailKey = thumbnailKey;
//     if (gifKey !== undefined) updateFields.gifKey = gifKey;
//     if (teaserKey !== undefined) updateFields.teaserKey = teaserKey;

//     // Find and update video document (no eventProcessed here yet)
//     const video = await videoModel.findOneAndUpdate(
//       { videoKey },
//       updateFields,
//       { new: true } // ensures the updated doc is returned
//     );

//     // Handle not found case
//     if (!video) {
//       return res.status(404).json({ message: "Video not found" });
//     }

//     // NEW: After update, check if all keys are now set, then set eventProcessed
//     if (video.thumbnailKey && video.gifKey && video.teaserKey) {
//       video.eventProcessed = true;
//       await video.save();
//       console.log("✅ All keys present; set eventProcessed to true");
//     } else {
//       console.log("ℹ️ Partial update; eventProcessed remains false");
//     }

//     // Return updated document
//     return res.status(200).json({
//       message: "Video updated successfully",
//       video,
//     });
//   } catch (error) {
//     console.error("❌ Error updating custom video:", error);
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: error.message });
//   }
// };

// Update a custom video — SAFE, NO BREAKS
// export const updateCustomNewVideo = async (req, res) => {
//   try {
//     const { videoKey, thumbnailKey, gifKey, teaserKey, captionKey } = req.body;

//     console.log("Received S3 keys:");
//     console.log("Video:", videoKey);
//     if (thumbnailKey) console.log("Thumbnail:", thumbnailKey);
//     if (gifKey) console.log("GIF:", gifKey);
//     if (teaserKey) console.log("Teaser:", teaserKey);
//     if (captionKey) console.log("Caption:", captionKey);

//     if (!videoKey) {
//       return res.status(400).json({ message: "videoKey is required" });
//     }

//     // Build update — only include keys that are sent
//     const updateFields = {};

//     if (thumbnailKey !== undefined) updateFields.thumbnailKey = thumbnailKey;
//     if (gifKey !== undefined) updateFields.gifKey = gifKey;
//     if (teaserKey !== undefined) updateFields.teaserKey = teaserKey;
//     if (captionKey !== undefined) {
//       updateFields.captionKey = captionKey;
//       updateFields.hasCaption = true; // Only set to true if captionKey exists
//     }

//     // DO NOT TOUCH hasCaption if captionKey is not sent

//     const video = await videoModel.findOneAndUpdate(
//       { videoKey },
//       updateFields,
//       { new: true }
//     );

//     if (!video) {
//       return res.status(404).json({ message: "Video not found" });
//     }

//     // eventProcessed: only if ALL 3 preview keys exist
//     if (video.thumbnailKey && video.gifKey && video.teaserKey) {
//       video.eventProcessed = true;
//       await video.save();
//       console.log("All preview assets ready → eventProcessed = true");
//     } else {
//       console.log("Partial update → eventProcessed remains false");
//     }

//     console.log("Final hasCaption:", video.hasCaption);
//     console.log("Final eventProcessed:", video.eventProcessed);

//     return res.status(200).json({
//       message: "Video updated successfully",
//       video,
//     });
//   } catch (error) {
//     console.error("Error updating custom video:", error);
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: error.message });
//   }
// };
export const updateCustomNewVideo = async (req, res) => {
  console.log("🟢 ENTERING updateCustomNewVideo CONTROLLER");

  try {
    const { videoKey, thumbnailKey, gifKey, teaserKey, captionKey } = req.body;
    console.log("📦 Request body received");

    if (!videoKey) {
      console.log("❌ Missing videoKey");
      return res.status(400).json({ message: "videoKey is required" });
    }

    console.log("🔍 Looking for video with key:", videoKey);

    // Build update fields
    const updateFields = {};
    if (thumbnailKey !== undefined) updateFields.thumbnailKey = thumbnailKey;
    if (gifKey !== undefined) updateFields.gifKey = gifKey;
    if (teaserKey !== undefined) updateFields.teaserKey = teaserKey;
    if (captionKey !== undefined) {
      updateFields.captionKey = captionKey;
      updateFields.hasCaption = true;
    }

    console.log("📝 Update fields:", updateFields);

    // Check if videoModel exists
    if (!videoModel) {
      console.log("❌ videoModel is undefined!");
      return res.status(500).json({ message: "Database model not available" });
    }

    const video = await videoModel.findOneAndUpdate(
      { videoKey },
      updateFields,
      { new: true }
    );

    console.log("🎯 Database query completed, video found:", !!video);

    if (!video) {
      console.log("❌ Video not found with key:", videoKey);
      return res.status(404).json({ message: "Video not found" });
    }

    // Update eventProcessed
    if (video.thumbnailKey && video.gifKey && video.teaserKey) {
      video.eventProcessed = true;
      await video.save();
      console.log("✅ All assets ready → eventProcessed = true");
    }

    console.log("✅ Final video state:", {
      hasCaption: video.hasCaption,
      eventProcessed: video.eventProcessed,
    });

    return res.status(200).json({
      message: "Video updated successfully",
      video: {
        id: video._id,
        videoKey: video.videoKey,
        thumbnailKey: video.thumbnailKey,
        gifKey: video.gifKey,
        teaserKey: video.teaserKey,
        captionKey: video.captionKey,
        hasCaption: video.hasCaption,
        eventProcessed: video.eventProcessed,
      },
    });
  } catch (error) {
    console.error("💥 ERROR in updateCustomNewVideo:", error);
    console.error("💥 Error stack:", error.stack);

    // ALWAYS return JSON, never HTML
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// get a video by id
export const getFreshVideoById = async (req, res) => {
  try {
    const { videoKey } = req.query;
    console.log("🔍 Backend searching for video with videoKey:", videoKey);

    const video = await videoModel.findOne({ videoKey });

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
