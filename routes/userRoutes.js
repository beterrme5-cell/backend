import { Router } from "express";
import 
{ 
    decryptUserToken,
    getUserContacts
} from "../controllers/userController.js";

export const userRoutes = Router();

// Importing Middlewares
import { authenticateToken } from "../middlewares/authenticateToken.js";

//Get User Data from GHL Key
userRoutes.post("/decryptUserToken", decryptUserToken);

//Get User Contacts
userRoutes.post("/getUserContacts", authenticateToken, getUserContacts);
