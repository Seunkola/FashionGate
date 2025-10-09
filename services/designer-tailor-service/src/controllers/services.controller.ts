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
        avilability: availability ? availability : false,
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

// Designers can update and delete only their own services

// Designers can view their service
