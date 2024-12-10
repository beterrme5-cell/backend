import userModel from "../models/userModel.js";
import historyModel from "../models/historyModel.js";
import { generateToken } from "../services/auth.js";
import { sanitizeUser } from "../services/sanitization.js";
import CryptoJS from "crypto-js";
import axios from "axios";

export const decryptUserToken = async (req, res) => {
  try {
    const { token } = req.body;
    const ssoDecryptionKey = process.env.SSO_DECRYPTION_KEY;

    var decryptedData = CryptoJS.AES.decrypt(token, ssoDecryptionKey).toString(
      CryptoJS.enc.Utf8
    );
    decryptedData = JSON.parse(decryptedData);

    if (decryptedData.userId) {
      const user = await userModel.findOne({
        accountId: decryptedData.userId,
        userLocationId: decryptedData.activeLocation
          ? decryptedData.activeLocation
          : "",
      });

      if (user) {
        user.accountEmail = decryptedData.email;
        await user.save();

        const token = generateToken(user);

        return res.status(200).send({
          message: "User token decrypted successfully",
          user: {
            accountId: user.accountId,
            userLocationId: user.userLocationId,
          },
          accessToken: token,
        });
      } else {
        return res.redirect("http://localhost:8000/oauth/callback");
      }
    } else {
      return res.status(400).send({
        message: "User token is invalid",
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserContacts = async (req, res) => {
  try {
    const { page = 1, pageLimit = 10 } = req.body;
    const user = req.user;

    console.log(user);

    const userData = await userModel.findOne({
      accountId: user.accountId,
      userLocationId: user.userLocationId,
    });
    if (!userData) {
      return res.status(400).send({
        message: "User not found",
      });
    }

    // console.log("abcd");
    // console.log(userData.accessToken);

    const options = {
      method: "POST",
      url: "https://services.leadconnectorhq.com/contacts/search",
      headers: {
        Authorization: `Bearer ${userData.accessToken}`,
        Version: process.env.GHL_API_VERSION,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data: {
        locationId: user.userLocationId,
        page: page,
        pageLimit: pageLimit,
      },
    };

    const { data } = await axios.request(options);

    return res.status(200).send({
      message: "Contacts retrieved successfully",
      contacts: data,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

export const getUserHistories = async (req, res) => {
  try 
  {
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

    //Get all histories for all videos of a user
    const histories = await historyModel.aggregate([
      {
        $lookup: {
          from: "videos", // Collection name for Video
          localField: "video", // Field in History referencing Video
          foreignField: "_id", // Field in Video being referenced
          as: "videoDetails", // Output field for the joined data
        },
      },
      {
        $unwind: "$videoDetails", // Flatten the videoDetails array
      },
      {
        $match: {
          "videoDetails.creator": userData._id, // Filter by user ID in Video
        },
      },
      {
        $addFields: {
          videoTitle: "$videoDetails.title", // Add videoName field
        },
      },
      {
        $project: {
          videoDetails: 0, // Exclude videoDetails field
        },
      },
    ]);


    return res.status(200).send({
      message: "Histories retrieved successfully",
      histories,
    });
  }
  catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message, error });
  }
};

export const getUserTags = async (req, res) => {
  try {
    const user = req.user;
    // console.log(user);
    const userData = await userModel.findOne({
      accountId: user.accountId,
      userLocationId: user.userLocationId,
    });
    if (!userData) {
      return res.status(400).send({
        message: "User not found",
      });
    }

    const options = {
      method: 'GET',
      url: `https://services.leadconnectorhq.com/locations/${userData.userLocationId}/tags`,
      headers: {Authorization: `Bearer ${userData.accessToken}`, Version: '2021-07-28', Accept: 'application/json'}
    };

    const { data } = await axios.request(options);

    return res.status(200).send({
      message: "User tags retrieved successfully",
      userTags: data.tags,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserLocationId = async (req, res) => {
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

    return res.status(200).send({
      message: "User location id retrieved successfully",
      userLocationId: userData.userLocationId,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
