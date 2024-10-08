import { Router } from "express";
import 
{ 
    userSignup,
    userLogin
} from "../controllers/userController.js";

export const userRoutes = Router();

// User Signup
userRoutes.post("/signup", userSignup);

// User Login
userRoutes.post("/login", userLogin);
