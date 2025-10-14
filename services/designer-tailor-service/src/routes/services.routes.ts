import { Router } from "express";
import { rbacAuthMiddleware, requiredRole } from "@/middleware/rbac";
import {
  createService,
  updateService,
  deleteService,
  getDesignerServices,
  getAllAvailableServices,
  getServiceByID,
} from "@/controllers/services.controller";

const router = Router();

router.post("/", rbacAuthMiddleware, requiredRole, createService);

router.put("/:id", rbacAuthMiddleware, requiredRole, updateService);

router.delete("/:id", rbacAuthMiddleware, requiredRole, deleteService);

router.get("/", rbacAuthMiddleware, requiredRole, getDesignerServices);

router.get("/available", getAllAvailableServices);

router.get("/:id", getServiceByID);

export default router;
