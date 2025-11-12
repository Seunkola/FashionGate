import { Router } from "express";
import multer from "multer";
import { AuthMiddleware } from "@/middleware/auth";
import {
  createProfileLocation,
  updateProfileLocation,
  getProfileLocation,
} from "@/controllers/profile.controller";
import {
  uploadProfileImage,
  deleteProfileImage,
} from "@/controllers/profileImage.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/location", AuthMiddleware, createProfileLocation);
router.put("/location", AuthMiddleware, updateProfileLocation);
router.get("/location", AuthMiddleware, getProfileLocation);
router.put(
  "/image",
  AuthMiddleware,
  upload.single("image"),
  uploadProfileImage
);
router.delete("/image", AuthMiddleware, deleteProfileImage);

export default router;
