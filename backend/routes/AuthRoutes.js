import { Signup, Login} from "../controllers/AuthController.js";
import { userVerification } from "../middleware/AuthMiddleware.js";
import {Router} from 'express';  

const router = Router();

router.post("/signup", Signup);
router.post("/login", Login);
router.post('/',userVerification);

export default router;