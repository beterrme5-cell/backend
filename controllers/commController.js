import axios from "axios";
import userModel from "../models/userModel.js";
import videoModel from "../models/videoModel.js";
import historyModel from "../models/historyModel.js";
import {
  getAllUserContacts,
  filterContactsByTags,
} from "../services/contactRetrieval.js";
export const sendSMSController = async (req, res) => {
  try {
    let { videoId, contactIds, message, sendAttachment, uploadedVideoName } = req.body;

    let videoExistsInternally = true;
    let video;

    if ( !contactIds || contactIds.length === 0) {
      return res.status(400).send({
        message: "Please provide at least one contact",
      });
    }

    if (!message) {
      return res.status(400).send({
        message: "Message is required",
      });
    }

    if (typeof sendAttachment !== "boolean") {
      return res.status(400).send({
        message: "sendAttachment must be a boolean",
      });
    }

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

    if ( videoId == "")
    {
      videoExistsInternally = false;
    }
    else
    {
      video = await videoModel.findById(videoId);

      if (!video) {
        return res.status(400).send({
          message: "Video not found",
        });
      }
    }

    // Helper function to create a delay
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    let results = [];
    for (let i = 0; i < contactIds.length; i += 100) {
      const batch = contactIds.slice(i, i + 100);

      // Process the current batch
      const batchResults = await Promise.all(
        batch.map(async (contact) => {
          try {
            let messageForContact = message + "";
            console.log(`Sending SMS to: ${contact.id}`);
            const response = await axios.post(
              "https://services.leadconnectorhq.com/conversations/messages",
              {
                type: "SMS",
                contactId: contact.id,
                message: messageForContact,
                ...(sendAttachment && videoId !== "" ? { attachments: [video.thumbnailURL] } : {}),
              },
              {
                headers: {
                  Authorization: `Bearer ${userData.accessToken}`,
                  Version: "2021-04-15",
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
              }
            );

            const smsHistoryData = {
              user: userData.id,
              contactName: `${contact.firstNameLowerCase} ${contact.lastNameLowerCase}`,
              contactAddress: contact.phone,
              sendType: "sms",
              subject: "",
              status: "sent",
              uploadedVideoName: videoExistsInternally ? video.title : uploadedVideoName
            };
            
            if (videoExistsInternally) {
              smsHistoryData.video = videoId;
            } 
            const smsHistory = await historyModel.create(smsHistoryData);

            return {
              contactId: contact.id,
              data: smsHistory,
              videoName: videoExistsInternally ? video.title : uploadedVideoName,
            };
          } catch (err) {
            const smsHistoryData = {
              user: userData.id,
              contactName: `${contact.firstNameLowerCase} ${contact.lastNameLowerCase}`,
              contactAddress: contact.phone,
              sendType: "sms",
              subject: "",
              status: "failed",
              uploadedVideoName: videoExistsInternally ? video.title : uploadedVideoName
            };
            
            if (videoExistsInternally) {
              smsHistoryData.video = videoId;
            } 
            const smsHistory = await historyModel.create(smsHistoryData);

            console.error(
              `Failed to send SMS to ${contact.id}:`,
              err.response?.data || err.message
            );
            return {
              contactId: contact.id,
              data: smsHistory,
              videoName: videoExistsInternally ? video.title : uploadedVideoName,
            };
          }
        })
      );

      results = results.concat(batchResults);

      // Wait 10 seconds before processing the next batch
      if (i + 100 < contactIds.length) {
        console.log("Waiting 10 seconds before sending the next batch...");
        await delay(10000);
      }
    }

    const failedSMS = results.filter((result) => result.status === "error");
    if (failedSMS.length > 0) {
      return res.status(207).send({
        message: "Some SMS failed to send",
        details: results,
      });
    }

    return res.status(200).send({
      message: "All SMS sent successfully",
      data: results,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const sendEmailController = async (req, res) => {
  try {
    let {
      videoId,
      contactIds,
      message,
      subject = "Konected - Loom Video",
      uploadedVideoName,
    } = req.body;

    let videoExistsInternally = true;
    let video;

    if ( !contactIds || contactIds.length === 0) {
      return res.status(400).send({
        message: "Please provide at least one contact",
      });
    }

    if (!message) {
      return res.status(400).send({
        message: "Message is required",
      });
    }

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

    if ( videoId == "")
    {
      videoExistsInternally = false;
    }
    else
    {
      video = await videoModel.findById(videoId);

      if (!video) {
        return res.status(400).send({
          message: "Video not found",
        });
      }
    }

    // Helper function to create a delay
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    let results = [];
    for (let i = 0; i < contactIds.length; i += 100) {
      const batch = contactIds.slice(i, i + 100);

      // Process the current batch
      const batchResults = await Promise.all(
        batch.map(async (contact) => {
          try {
            let messageForContact = message + "";
            console.log(`Sending email to: ${contact.id}`);
            const response = await axios.post(
              "https://services.leadconnectorhq.com/conversations/messages",
              {
                type: "Email",
                contactId: contact.id,
                subject: subject,
                html: messageForContact,
              },
              {
                headers: {
                  Authorization: `Bearer ${userData.accessToken}`,
                  Version: "2021-04-15",
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
              }
            );

            const emailHistoryData = {
              user: userData._id,
              contactName: `${contact.firstNameLowerCase} ${contact.lastNameLowerCase}`,
              contactAddress: contact.email,
              sendType: "email",
              subject: subject,
              status: "sent",
              uploadedVideoName: videoExistsInternally ? video.title : uploadedVideoName
            };
            
            if (videoExistsInternally) {
              emailHistoryData.video = videoId;  // Only add `video` if it exists internally
            } 
            
            const emailHistory = await historyModel.create(emailHistoryData);

            return {
              contactId: contact.id,
              data: emailHistory,
              videoName: videoExistsInternally ? video.title : uploadedVideoName,
            };
          } catch (err) {
            const emailHistoryData = {
              user: userData._id,
              contactName: `${contact.firstNameLowerCase} ${contact.lastNameLowerCase}`,
              contactAddress: contact.email,
              sendType: "email",
              subject: subject,
              status: "sent",
              uploadedVideoName: videoExistsInternally ? video.title : uploadedVideoName
            };
            
            if (videoExistsInternally) {
              emailHistoryData.video = videoId;  // Only add `video` if it exists internally
            } 
            
            const emailHistory = await historyModel.create(emailHistoryData);

            console.error(
              `Failed to send email to ${contact.id}:`,
              err.response?.data || err.message
            );
            return {
              contactId: contact.id,
              data: emailHistory,
              videoName: videoExistsInternally ? video.title : uploadedVideoName,
            };
          }
        })
      );

      results = results.concat(batchResults);

      // Wait 10 seconds before processing the next batch
      if (i + 100 < contactIds.length) {
        console.log("Waiting 10 seconds before sending the next batch...");
        await delay(10000);
      }
    }

    const failedEmails = results.filter((result) => result.status === "error");
    if (failedEmails.length > 0) {
      return res.status(207).send({
        message: "Some emails failed to send",
        details: results,
      });
    }

    return res.status(200).send({
      message: "All emails sent successfully",
      data: results,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
