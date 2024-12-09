import axios from "axios";
import userModel from "../models/userModel.js";
import videoModel from "../models/videoModel.js";
import historyModel from "../models/historyModel.js";
import { getAllUserContacts, filterContactsByTags } from "../services/contactRetrieval.js";

export const sendSMSController = async (req, res) => {
  try {
    let { videoId, contactIds, message, sendToAll, tags } = req.body;

    if ((!contactIds || contactIds.length === 0) && sendToAll === false) {
      return res.status(400).send({
        message: "Please provide at least one contact id",
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
      userLocationId: user.userLocationId,
    });

    if (!userData) {
      return res.status(400).send({
        message: "User not found",
      });
    }

    if (sendToAll === true) {
      contactIds = await getAllUserContacts(user, userData, false);
    }

    if (tags && tags.length > 0) {
      contactIds = await filterContactsByTags(contactIds, tags);
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
            console.log(`Sending SMS to: ${contact.id}`);
            const response = await axios.post(
              "https://services.leadconnectorhq.com/conversations/messages",
              {
                type: "SMS",
                contactId: contact.id,
                message: message,
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

            const smsHistory = await historyModel.create({
              video: videoId,
              contactName: `${contact.firstNameLowerCase} ${contact.lastNameLowerCase}`,
              contactAddress: contact.phone,
              sendType: "sms",
              subject: "",
              status: "sent",
            });

            const video = await videoModel.findById(videoId);

            return { contactId: contact.id, data: smsHistory, videoName: video.title };
          } catch (err) {
            const smsHistory = await historyModel.create({
              video: videoId,
              contactName: `${contact.firstNameLowerCase} ${contact.lastNameLowerCase}`,
              contactAddress: contact.phone,
              sendType: "sms",
              subject: "",
              status: "failed",
            });

            const video = await videoModel.findById(videoId);

            console.error(
              `Failed to send SMS to ${contact.id}:`,
              err.response?.data || err.message
            );
            return {
              contactId: contact.id,
              data: smsHistory,
              videoName: video.title,
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
    let { videoId, contactIds, message, sendToAll, subject = "Konected - Loom Video", tags } = req.body;

    if ((!contactIds || contactIds.length === 0) && sendToAll === false) {
      return res.status(400).send({
        message: "Please provide at least one email id",
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
      userLocationId: user.userLocationId,
    });

    if (!userData) {
      return res.status(400).send({
        message: "User not found",
      });
    }

    if (sendToAll == true)
    {
      contactIds = await getAllUserContacts(user, userData, true);
    }

    if (tags && tags.length > 0) {
      contactIds = await filterContactsByTags(contactIds, tags);
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
          console.log(`Sending email to: ${contact.id}`);
          const response = await axios.post(
            "https://services.leadconnectorhq.com/conversations/messages",
            {
              type: "Email",
              contactId: contact.id,
              subject: subject,
              html: message,
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

          const emailHistory = await historyModel.create({
            video: videoId,
            contactName: `${contact.firstNameLowerCase} ${contact.lastNameLowerCase}`,
            contactAddress: contact.email,
            sendType: "email",
            subject: subject,
            status: "sent",
          });

          const video = await videoModel.findById(videoId);

          return { contactId: contact.id, data: emailHistory, videoName: video.title };
        } catch (err) {
          const emailHistory = await historyModel.create({
            video: videoId,
            contactName: `${contact.firstNameLowerCase} ${contact.lastNameLowerCase}`,
            contactAddress: contact.email,
            sendType: "email",
            subject: subject,
            status: "failed",
          });

          const video = await videoModel.findById(videoId);

          console.error(
            `Failed to send email to ${contact.id}:`,
            err.response?.data || err.message
          );
          return {
            contactId: contact.id,
            data: emailHistory,
            videoName: video.title,
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