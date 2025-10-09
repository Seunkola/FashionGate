import { Router } from "express";
import { rbacAuthMiddleware, requiredRole } from "@/middleware/rbac";
import { createService } from "@/controllers/services.controller";

const router = Router();

router.post("/", rbacAuthMiddleware, requiredRole, createService);

export default router;
