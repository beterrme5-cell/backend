import axios from "axios";
import dotenv from "dotenv";
import qs from "qs";

// Configuring the environment variables
dotenv.config();

export const callback = async (req, res) => {
  try {
    const body = {
      code: req.query.code,
      client_id: process.env.GHL_CLIENT_ID,
      client_secret: process.env.GHL_CLIENT_SECRET,
      grant_type: "authorization_code",
      user_type: "Location",
    };

    const response = await axios.post(
      "https://services.leadconnectorhq.com/oauth/token",
      qs.stringify({
        code: req.query.code,
        client_id: process.env.GHL_CLIENT_ID,
        client_secret: process.env.GHL_CLIENT_SECRET,
        grant_type: "authorization_code",
        user_type: "Location",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return res.json({
      message: "Successfully received the token",
      data: response.data,
    });
  } catch (error) {
    console.error("Error during API call:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
