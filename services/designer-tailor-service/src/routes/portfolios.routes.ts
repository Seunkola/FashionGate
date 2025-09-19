import { Router } from "express";
import multer from "multer";
import { rbacAuthMiddleware, requiredRole } from "@/middleware/rbac";
import {
  createPortfolio,
  getPortfolios,
  getPortfolioById,
  updatePortfolio,
  deletePortfolioImage,
  deletePortfolio,
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

router.put(
  "/:id",
  rbacAuthMiddleware,
  requiredRole,
  upload.array("images"),
  updatePortfolio
);

router.delete("/:id", rbacAuthMiddleware, requiredRole, deletePortfolio);

router.delete(
  "/:portfolioId/images/:imageId",
  rbacAuthMiddleware,
  requiredRole,
  deletePortfolioImage
);

export default router;
