import axios from "axios";
import userModel from "../models/userModel.js";

export const sendSMSController = async (req, res) => {
  try {
    const { contactIds, message } = req.body;

    if (!contactIds || contactIds.length === 0) {
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

    // Use Promise.all to send emails
    const emailPromises = contactIds.map(async (contactId) => {
      try {
        console.log(`Sending SMS to: ${contactId}`);
        const response = await axios.post(
          "https://services.leadconnectorhq.com/conversations/messages",
          {
            type: "SMS",
            contactId: contactId, // Ensure this is a valid field
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
        return { contactId, status: "success", data: response.data };
      } catch (err) {
        console.error(
          `Failed to send SMS to ${contactId}:`,
          err.response?.data || err.message
        );
        return {
          emailId,
          status: "error",
          error: err.response?.data || err.message,
        };
      }
    });

    const results = await Promise.all(emailPromises);

    const failedEmails = results.filter((result) => result.status === "error");
    if (failedEmails.length > 0) {
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
    const { contactIds, message } = req.body;

    if (!contactIds || contactIds.length === 0) {
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

    // Use Promise.all to send emails
    const emailPromises = contactIds.map(async (contactId) => {
      try {
        console.log(`Sending email to: ${contactId}`);
        const response = await axios.post(
          "https://services.leadconnectorhq.com/conversations/messages",
          {
            type: "Email",
            contactId: contactId, // Ensure this is a valid field
            subject: "Konected - Loom Video",
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
        return { contactId, status: "success", data: response.data };
      } catch (err) {
        console.error(
          `Failed to send email to ${contactId}:`,
          err.response?.data || err.message
        );
        return {
          emailId,
          status: "error",
          error: err.response?.data || err.message,
        };
      }
    });

    const results = await Promise.all(emailPromises);

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
