import { Request, Response } from "express";
import { prisma } from "@/services/prismaClient";
import { supabase } from "@/services/supabaseClient";

// Designers and tailors can create services
export async function createService(req: Request, res: Response) {
  try {
    //get designer id
    const userID = (req as any).user.id;
    const { name, description, price, duration, availability } = req.body;

    // check if required params are not null
    if (!name)
      return res.error("BAD_REQUEST", "Service name is required!", 400);
    if (!description)
      return res.error("BAD_REQUEST", "Service description is required!", 400);
    if (!price) return res.error("BAD_REQUEST", "Provide Service price", 400);
    if (!duration)
      return res.error("BAD_REQUEST", "Service Duration is required!", 400);

    //create new service in DB
    const newService = await prisma.service.create({
      data: {
        name: name,
        description: description,
        designer_id: userID,
        price: Number(price),
        duration_days: Number(duration),
        availability: availability ? availability : false,
      },
    });

    return res.success(newService, "Service created Successfully");
  } catch (error) {
    return res.error(
      "INTERNAL_SERVER_ERROR",
      "Something went wrong" + error,
      500
    );
  }
}

// Designers can update only their own services
export async function updateService(req: Request, res: Response) {
  try {
    //get designer id
    const userID = (req as any).user.id;
    const serviceID = req.params.id;
    const { name, description, price, duration, availability } = req.body;

    // check if params are needed to be updated are not null
    if (
      !name &&
      !description &&
      !price &&
      !duration &&
      availability === undefined
    )
      return res.error("BAD_REQUEST", "No fields to update!", 400);

    //check if service exists and belongs to the designer
    const existingService = await prisma.service.findFirst({
      where: { id: serviceID, designer_id: userID },
    });

    if (!existingService) {
      return res.error(
        "NOT_FOUND",
        "Service not found or you don't have permission to update it",
        404
      );
    }

    //update service in DB
    const updatedService = await prisma.service.update({
      where: { id: serviceID },
      data: {
        name: name ? name : existingService.name,
        description: description ? description : existingService.description,
        price: price ? Number(price) : existingService.price,
        duration_days: duration
          ? Number(duration)
          : existingService.duration_days,
        availability: availability
          ? availability
          : existingService.availability,
      },
    });

    return res.success(updatedService, "Service updated Successfully");
  } catch (error) {
    return res.error(
      "INTERNAL_SERVER_ERROR",
      "Something went wrong" + error,
      500
    );
  }
}

// Designers can only their own services
export async function deleteService(req: Request, res: Response) {
  try {
    //get designer id
    const userID = (req as any).user.id;
    const serviceID = req.params.id;

    //check if service exists and belongs to the designer
    const existingService = await prisma.service.findFirst({
      where: { id: serviceID, designer_id: userID },
    });

    if (!existingService) {
      return res.error(
        "NOT_FOUND",
        "Service not found or you don't have permission to delete it",
        404
      );
    }

    //delete service in DB
    await prisma.service.delete({
      where: { id: serviceID },
    });

    return res.success(null, "Service deleted Successfully");
  } catch (error) {
    return res.error(
      "INTERNAL_SERVER_ERROR",
      "Something went wrong" + error,
      500
    );
  }
}

// Designers can view all their service with pagination
export async function getDesignerServices(req: Request, res: Response) {
  try {
    //get designer id
    const userID = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    //get services from DB
    const services = await prisma.service.findMany({
      where: { designer_id: userID },
      skip: offset,
      take: limit,
      orderBy: { created_at: "desc" },
    });

    const totalServices = await prisma.service.count({
      where: { designer_id: userID },
    });
    const totalPages = Math.ceil(totalServices / limit);
    return res.success(
      {
        services,
        pagination: {
          totalItems: totalServices,
          totalPages: totalPages,
          currentPage: page,
        },
      },
      "Services fetched Successfully"
    );
  } catch (error) {
    return res.error(
      "INTERNAL_SERVER_ERROR",
      "Something went wrong" + error,
      500
    );
  }
}

// Anyone can view all available services with pagination
export async function getAllAvailableServices(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = (req.query.search as string) || "";

    //get services from DB
    const services = await prisma.service.findMany({
      where: {
        availability: true,
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      skip: offset,
      take: limit,
      orderBy: { created_at: "desc" },
    });

    const totalServices = await prisma.service.count({
      where: {
        availability: true,
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    });
    const totalPages = Math.ceil(totalServices / limit);
    return res.success(
      {
        services,
        pagination: {
          totalItems: totalServices,
          totalPages: totalPages,
          currentPage: page,
        },
      },
      "Services fetched Successfully"
    );
  } catch (error) {
    return res.error(
      "INTERNAL_SERVER_ERROR",
      "Something went wrong" + error,
      500
    );
  }
}

// Anyone can view a specific service by ID
export async function getServiceByID(req: Request, res: Response) {
  try {
    const serviceID = req.params.id;

    //get service from DB
    const service = await prisma.service.findUnique({
      where: { id: serviceID },
    });

    if (!service) {
      return res.error("NOT_FOUND", "Service not found", 404);
    }
    return res.success(service, "Service fetched Successfully");
  } catch (error) {
    return res.error(
      "INTERNAL_SERVER_ERROR",
      "Something went wrong" + error,
      500
    );
  }
}
