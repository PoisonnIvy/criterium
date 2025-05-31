import { Signup, Login, Logout, checkAuth} from "../controllers/AuthController.js";
import { requireAuth } from "../middleware/AuthMiddleware.js";
import {Router} from 'express';  

const router = Router();

router.post("/signup", Signup);
router.post("/login", Login);
router.post("/logout",requireAuth, Logout)
router.get("/me", checkAuth);

export default router;