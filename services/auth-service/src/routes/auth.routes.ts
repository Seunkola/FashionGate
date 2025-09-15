import { Router } from "express";
import  * as authControllers  from "../controllers/auth.controller";

const router = Router();

router.post("/signup", authControllers.signUp);
router.post("/signin", authControllers.signIn);
router.post("/signout", authControllers.signOut);
router.post("/reset-password", authControllers.resetPassword);
router.post("/update-password", authControllers.updatePassword);

export default router;