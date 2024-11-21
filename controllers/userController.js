import userModel from "../models/userModel.js";
import { generateToken } from "../services/auth.js";
import { sanitizeUser } from "../services/sanitization.js";
import CryptoJS from "crypto-js";
import axios from "axios";

export const decryptUserToken = async (req, res) =>
{
    try
    {
        const { token } = req.body;
        const ssoDecryptionKey = process.env.SSO_DECRYPTION_KEY;

        var decryptedData = CryptoJS.AES.decrypt(token, ssoDecryptionKey).toString(CryptoJS.enc.Utf8);
        decryptedData = JSON.parse(decryptedData);

        if (decryptedData.userId)
        {
            const user = await userModel.findOne({ accountId: decryptedData.userId, userLocationId: (decryptedData.activeLocation ? decryptedData.activeLocation : "") });

            if (user)
            {
                user.accountEmail = decryptedData.email;
                await user.save();

                const token = generateToken(user);
                res.cookie("accessToken", token);

                return res.status(200).send({
                    message: "User token decrypted successfully",
                    user: {
                        accountId: user.accountId,
                        userLocationId: user.userLocationId,
                    }
                });
            }
            else
            {
                return res.redirect("http://localhost:8000/oauth/callback");
            }
        }
        else
        {
            return res.status(400).send({
                message: "User token is invalid",
            });
        }
    }
    catch(error)
    {
        res.status(400).json({ message: error.message });
    }
}

export const getUserContacts = async (req, res) =>
{
    try
    {
        const { page = 1, pageLimit = 10 } = req.body;
        const user = req.user;

        const userData = await userModel.findOne({ accountId: user.accountId, userLocationId: user.userLocationId });
        if (!userData) {
            return res.status(400).send({
                message: "User not found",
            });
        }

        const options = {
        method: 'POST',
        url: 'https://services.leadconnectorhq.com/contacts/search',
        headers: {
            Authorization: `Bearer ${userData.accessToken}`,
            Version: process.env.GHL_API_VERSION,
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        data: {
            locationId: user.userLocationId,
            page: page,
            pageLimit: pageLimit
        }
        };

        const { data } = await axios.request(options);

        return res.status(200).send({
            message: "Contacts retrieved successfully",
            contacts: data,
        });
    }
    catch(error)
    {
        res.status(400).json({ message: error.message });
    }
}
