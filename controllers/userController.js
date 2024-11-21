import userModel from "../models/userModel.js";
import { generateToken } from "../services/auth.js";
import { sanitizeUser } from "../services/sanitization.js";
import CryptoJS from "crypto-js";

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
            const user = await userModel.findOne({ accountId: decryptedData.userId, userlocationId: (decryptedData.activeLocation ? decryptedData.activeLocation : "") });

            if (user)
            {
                user.accountEmail = decryptedData.email;
                await user.save();

                return res.status(200).send({
                    message: "User token decrypted successfully",
                    user: {
                        accountId: user.accountId,
                        userlocationId: user.userlocationId,
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
