import axios from "axios";
import dotenv from "dotenv";
import qs from "qs";
import userModel from "../models/userModel.js";

// Configuring the environment variables
dotenv.config();

export const callback = async (req, res) => {
  try {
    if (!req.query.code) {
      return res.status(400).send("Code not found");
    }

    const response = await axios.post(
      "https://services.leadconnectorhq.com/oauth/token",
      qs.stringify({
        code: req.query.code,
        client_id: process.env.GHL_CLIENT_ID,
        client_secret: process.env.GHL_CLIENT_SECRET,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const locationId = response.data.locationId ? response.data.locationId : "";
    const userId = response.data.userId;
    const access_token = response.data.access_token;
    const refresh_token = response.data.refresh_token;
    const expires_in = response.data.expires_in;
    const scope = response.data.scope;
    const companyId = response.data.companyId;


    var expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + (expires_in - 60));

    let domain = "";

    if (companyId && locationId == "") 
    {
      const options = {
        method: 'GET',
        url: `https://services.leadconnectorhq.com/companies/${companyId}`,
        headers: {Authorization: 'Bearer 123', Version: '2021-07-28', Accept: 'application/json'}
      };

      const { data } = await axios.request(options);

      domain = data?.company?.domain;
    }
    else
    {
      const agencyAccount = await userModel.findOne({ companyId: companyId, userLocationId: "" });

      if (agencyAccount) {
        domain = agencyAccount?.domain;
      }
    }

    await userModel.findOneAndUpdate(
      { accountId: userId, userLocationId: locationId },
      {
        $set: {
          accountId: userId,
          userLocationId: locationId,
          accessToken: access_token,
          refreshToken: refresh_token,
          expiryDate: expiryDate,
          scope: scope,
          companyId: companyId,
          userCode: req.query.code,
          domain: domain
        },
      },
      { new: true, upsert: true } // Upsert option added
    );

    if (locationId !== "") {
      const options = {
        method: "GET",
        url: `https://services.leadconnectorhq.com/locations/${locationId}`,
        headers: {
          Authorization: `Bearer ${access_token}`,
          Version: "2021-07-28",
          Accept: "application/json",
        },
      };
      const { data } = await axios.request(options);
      console.log("Domain: ", data.location.domain);
      if (data.location.domain && data.location.domain !== "") {
        return res.redirect(
          `https://${data.location.domain}/location/${locationId}`
        );
      }
    }

    return res.redirect(
      `https://app.gohighlevel.com/v2/location/${locationId}`
    );
  } catch (error) {
    console.error("Error during API call:", error);
  }
};
