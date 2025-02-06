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
        companyId: decryptedData.companyId,
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
        const user = await userModel.findOne({
          companyId: decryptedData.companyId,
          userLocationId: decryptedData.activeLocation
            ? decryptedData.activeLocation
            : "",
        });

        if (user) {
          const newUserProfile = await userModel.create({
            accountId: decryptedData.userId,
            userLocationId: decryptedData.activeLocation
              ? decryptedData.activeLocation
              : "",
            companyId: decryptedData.companyId,
            domain: user.domain,
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
            expiryDate: user.expiryDate,
            scope: user.scope,
            showDomainPopup: user.showDomainPopup,
            userCode: user.userCode,
            accountEmail: decryptedData.email,
          });

          const token = generateToken(newUserProfile);

          return res.status(200).send({
            message: "User token decrypted successfully",
            user: {
              accountId: newUserProfile.accountId,
              companyId: newUserProfile.companyId,
              userLocationId: newUserProfile.userLocationId,
            },
            accessToken: token,
          });
        } else {
          return res.status(400).send({
            message: "User not found",
          });
        }
      }
    } else {
      return res.status(400).send({
        message: "User token is invalid",
      });
    }
  } catch (error) {
    console.log("decryptUserToken error => ", error);
    res.status(400).json({ message: error.message });
  }
};

export const getUserContacts = async (req, res) => {
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
      // Start fetching contacts, starting with page 1
      let allContacts = [];
      let currentPage = 1;
      let hasMoreContacts = true;

      // Helper function to create a delay
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  
      while (hasMoreContacts) {
        // Set pageLimit to 100 for each request
        const response = await axios.request({
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
            page: currentPage,
            pageLimit: 100,
          },
        });
  
        const data = response.data;
        const contacts = data.contacts || [];
  
        // Add fetched contacts to the list
        allContacts = [...allContacts, ...contacts];
  
        // Check if there are more contacts to fetch (based on the total number of contacts and page limit)
        if (currentPage * 100 >= data.total) {
          hasMoreContacts = false;
        }

        // Wait 10 seconds before processing the next batch
        if (currentPage % 50 === 0 && currentPage !== 1) {
          console.log("Waiting 10 seconds before sending the next batch...");
          await delay(10000);
        }

        currentPage++; // Move to the next page
      }

    return res.status(200).send({
      message: "Contacts retrieved successfully",
      contacts: allContacts,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

export const getUserHistories = async (req, res) => {
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
  } catch (error) {
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
      companyId: user.companyId,
      userLocationId: user.userLocationId,
    });
    if (!userData) {
      return res.status(400).send({
        message: "User not found",
      });
    }

    const options = {
      method: "GET",
      url: `https://services.leadconnectorhq.com/locations/${userData.userLocationId}/tags`,
      headers: {
        Authorization: `Bearer ${userData.accessToken}`,
        Version: "2021-07-28",
        Accept: "application/json",
      },
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
      companyId: user.companyId,
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

export const getUserDomain = async (req, res) => {
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

    return res.status(200).send({
      message: "User domain retrieved successfully",
      userDomain: userData.domain,
      showDomainPopup: userData.showDomainPopup,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserContactsByTags = async (req, res) => {
  try {
    const user = req.user;

    let { tags } = req.query;

    if (!tags) {
      return res.status(400).send({
        message: "Tags not found",
      });
    }

    // Handle tags as JSON string or array
    if (typeof tags === "string") {
      try {
        tags = JSON.parse(tags); // Attempt to parse if it's a JSON string
      } catch {
        tags = tags.split(",").map((tag) => tag.trim()); // Fallback to comma-separated string
      }
    }

    if (!Array.isArray(tags)) {
      return res.status(400).send({
        message: "Tags must be an array or a comma-separated string",
      });
    }

    if (tags.length === 0) {
      return res.status(400).send({
        message: "Tags array cannot be empty",
      });
    }

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

    let filters = [
      {
        group: "OR",
        filters: [
          {
            field: "tags",
            operator: "eq",
            value: tags,
          },
        ],
      },
    ];

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
        page: 1,
        pageLimit: 20,
        filters: filters,
      },
    };

    const { data } = await axios.request(options);

    const retrievedContacts = data.contacts.map((contact) => ({
      name: contact.firstNameLowerCase + " " + contact.lastNameLowerCase,
      email: contact.email,
      phone: contact.phone,
    }));

    return res.status(200).send({
      message: "Contacts retrieved successfully",
      contacts: retrievedContacts,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

export const getCustomFields = async (req, res) => {
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

    const options = {
      method: "GET",
      url: `https://services.leadconnectorhq.com/locations/${user.userLocationId}/customFields`,
      headers: {
        Authorization: `Bearer ${userData.accessToken}`,
        Version: process.env.GHL_API_VERSION,
        Accept: "application/json",
      },
      params: { model: "contact" },
    };

    const { data } = await axios.request(options);

    return res.status(200).send({
      message: "Custom fields retrieved successfully",
      customFields: data.customFields,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

export const updateUserDomain = async (req, res) => {
  try {
    const user = req.user;
    const { domain, showDomainPopup } = req.body;

    if (typeof domain !== "string") {
      return res.status(400).send({
        message: "Domain must be a string",
      });
    }

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

    userData.domain = domain;
    userData.showDomainPopup = showDomainPopup;

    await userData.save();

    return res.status(201).send({
      message: "Domain updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};
