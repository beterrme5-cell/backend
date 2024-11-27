import { Router } from "express";
import 
{ 
    decryptUserToken,
    getUserContacts,
    getUserHistories
} from "../controllers/userController.js";

export const userRoutes = Router();

// Importing Middlewares
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { verifyAccessToken } from "../middlewares/refreshAccessToken.js";

//Get User Data from GHL Key
userRoutes.post("/decryptUserToken", decryptUserToken);

//Get User Contacts
userRoutes.post("/getUserContacts", authenticateToken, verifyAccessToken, getUserContacts);

//Get User Histories
userRoutes.get("/getUserHistories", authenticateToken, getUserHistories);
