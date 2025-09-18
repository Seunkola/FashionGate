import { Router } from "express";
import multer from "multer";
import { rbacAuthMiddleware, requiredRole } from "@/middleware/rbac";
import {
  createPortfolio,
  getPortfolios,
  getPortfolioById,
} from "@/controllers/portfolio.controller";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.post(
  "/",
  rbacAuthMiddleware,
  requiredRole,
  upload.array("images"),
  createPortfolio
);

router.get("/", rbacAuthMiddleware, getPortfolios);

router.get("/:id", rbacAuthMiddleware, getPortfolioById);

export default router;
