import { Signup, Login, Logout, checkAuth, Validate} from "../controllers/AuthController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import {Router} from 'express';  

const router = Router();

router.post("/signup", Signup); 
router.post("/verify", Validate); 
router.post("/login", Login);
router.post("/logout",requireAuth, Logout)
router.get("/me", checkAuth);
export default router;