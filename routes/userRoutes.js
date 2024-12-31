import { Router } from "express";
import {
  decryptUserToken,
  getUserContacts,
  getUserHistories,
  getUserTags,
  getUserLocationId,
  getUserDomain,
  getUserContactsByTags,
  getCustomFields,
} from "../controllers/userController.js";

export const userRoutes = Router();

// Importing Middlewares
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { verifyAccessToken } from "../middlewares/refreshAccessToken.js";

//Get User Data from GHL Key
userRoutes.post("/decryptUserToken", decryptUserToken);

//Get User Contacts
userRoutes.post(
  "/getUserContacts",
  authenticateToken,
  verifyAccessToken,
  getUserContacts
);

//Get User Histories
userRoutes.get("/getUserHistories", authenticateToken, getUserHistories);

//Get User Tags
userRoutes.get(
  "/getUserTags",
  authenticateToken,
  verifyAccessToken,
  getUserTags
);

//Get User Location Id
userRoutes.get("/getUserLocationId", authenticateToken, getUserLocationId);

//Get User Domain
userRoutes.get(
  "/getUserDomain",
  authenticateToken,
  verifyAccessToken,
  getUserDomain
);

//Get User Contacts by Tags
userRoutes.get(
  "/getUserContactsByTags",
  authenticateToken,
  verifyAccessToken,
  getUserContactsByTags
);

// Get Custom Fields of User
userRoutes.get(
  "/getUserCustomFields",
  authenticateToken,
  verifyAccessToken,
  getCustomFields
);
