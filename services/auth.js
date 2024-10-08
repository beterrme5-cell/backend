import Jwt from "jsonwebtoken";

export const generateToken = (user) => {

    try
    {
        const payload = {
            id: user._id,
            email: user.email,
        };

        const token = Jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        return token;

    }
    catch(error)
    {
        throw new Error(error);
    }
}