import Jwt from "jsonwebtoken";

export const generateToken = (user) => {

    try
    {
        const payload = {
            accountId: user.accountId,
            userLocationId: user.userLocationId,
        };

        const token = Jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        return token;

    }
    catch(error)
    {
        throw new Error(error);
    }
}