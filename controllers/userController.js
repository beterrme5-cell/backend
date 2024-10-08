import userModel from "../models/userModel.js";
import { generateToken } from "../services/auth.js";
import { sanitizeUser } from "../services/sanitization.js";

export const userSignup = async (req, res) => {
    try {

        const { accountId, name, email, password } = req.body;

        const newUser = await userModel.create({
            accountId,
            name,
            email,
            password,
        });

        const token = generateToken(newUser);

        res.status(201).send({
            message: "User created successfully",
            token,
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const userLogin = async (req, res) => 
{
    try
    {
        const { email, password } = req.body;

        const data = await userModel.matchPasswordAndGenerateToken(
            email,
            password,
        );
      
        const { user, accessToken } = data;

        //remove password and salt from user
        const sanitizedUser = sanitizeUser(user);

        res.status(200).send({
            message: "User logged in successfully",
            user: sanitizedUser,
            token: accessToken,
        });


    }
    catch(error)
    {
        res.status(400).json({ message: error.message });
    }
}
