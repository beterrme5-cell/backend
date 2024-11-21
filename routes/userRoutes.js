import { Router } from "express";
import 
{ 
    decryptUserToken,
    getUserContacts
} from "../controllers/userController.js";

export const userRoutes = Router();

// Importing Middlewares
import { userAuthVerification } from "../middlewares/userAuthVerification.js";

//Get User Data from GHL Key
userRoutes.post("/decryptUserToken", decryptUserToken);

//Get User Contacts
userRoutes.post("/getUserContacts", userAuthVerification, getUserContacts);
