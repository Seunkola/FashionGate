import { Request, Response, NextFunction } from "express";
import { supabase } from "@/services/supabaseClient";
import { prisma } from "@/services/prismaClient";

export async function rbacAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.error("UNAUTHORIZED", "Authorization header missing", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.error("UNAUTHORIZED", "Token missing", 401);
    }

    //verify token with supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.error("UNAUTHORIZED", "Invalid token", 401);
    }

    //fetch user from db
    const userDetails = await prisma.user.findUnique({
      where: { id: user.id },
      include: { role: true },
    });

    if (!userDetails) {
      return res.error("UNAUTHORIZED", "User not found", 401);
    }

    //attach user to request object
    (req as any).user = {
      id: userDetails.id,
      email: userDetails.email,
      role: userDetails?.role?.name,
      firstName: userDetails.first_name,
      lastName: userDetails.last_name,
    };

    next();
    return;
  } catch (error) {
    return res.error("INTERNAL_SERVER_ERROR", "Something went wrong", 500);
  }
}

// RBAC middleware check for roles
export function requiredRole(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || (user.role !== "designer" && user.role !== "tailor")) {
    return res.error(
      "FORBIDDEN",
      "You do not have permission to access this resource",
      403
    );
  }
  return next();
}
