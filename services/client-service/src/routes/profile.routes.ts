import { Router } from "express";
import { AuthMiddleware } from "@/middleware/auth";
import {
  createProfileLocation,
  updateProfileLocation,
  getProfileLocation,
} from "@/controllers/profile.controller";

const router = Router();
router.post("/location", AuthMiddleware, createProfileLocation);
router.put("/location", AuthMiddleware, updateProfileLocation);
router.get("/location", AuthMiddleware, getProfileLocation);

export default router;
