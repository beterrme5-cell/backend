import { Router } from "express";
import 
{ 
    decryptUserToken
} from "../controllers/userController.js";

export const userRoutes = Router();

//Get User Data from GHL Key
userRoutes.post("/decryptUserToken", decryptUserToken);
