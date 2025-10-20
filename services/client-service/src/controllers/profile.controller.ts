import { Request, Response } from "express";
import { prisma } from "@/services/prismaClient";

// handle profile creation which includes user location, update, retrieval

//create user profile location
export async function createProfileLocation(req: Request, res: Response) {
  try {
    const userID = (req as any).user.id;
    const { address, localGovernment, city, state, country } = req.body;

    // check if required params are not null
    if (!address || !localGovernment || !city || !state || !country) {
      return res.error("BAD_REQUEST", "All fields are required!", 400);
    }

    //create new user profile Location in DB
    const newProfileLocation = await prisma.userLocation.create({
      data: {
        address: address,
        local_government: localGovernment,
        city: city,
        state: state,
        country: country,
        user_id: userID,
      },
    });
    return res.success(newProfileLocation, "Profile created Successfully");
  } catch (error) {
    return res.error(
      "INTERNAL_SERVER_ERROR",
      "Something went wrong" + error,
      500
    );
  }
}

// update user profile location
export async function updateProfileLocation(req: Request, res: Response) {
  try {
    const userID = (req as any).user.id;
    const { address, localGovernment, city, state, country } = req.body;

    // check if at least one param is provided for update
    if (!address && !localGovernment && !city && !state && !country) {
      return res.error(
        "BAD_REQUEST",
        "At least one field is required to update!",
        400
      );
    }

    //check if profile location exists for the user
    const existingLocation = await prisma.userLocation.findUnique({
      where: { user_id: userID },
    });

    if (!existingLocation) {
      return res.error("NOT_FOUND", "Profile location not found!", 404);
    }

    //update user profile location in DB
    const updatedLocation = await prisma.userLocation.update({
      where: { user_id: userID },
      data: {
        address: address || existingLocation.address,
        local_government: localGovernment || existingLocation.local_government,
        city: city || existingLocation.city,
        state: state || existingLocation.state,
        country: country || existingLocation.country,
      },
    });

    return res.success(
      updatedLocation,
      "Profile location updated Successfully"
    );
  } catch (error) {
    return res.error(
      "INTERNAL_SERVER_ERROR",
      "Something went wrong" + error,
      500
    );
  }
}

// get user profile location
export async function getProfileLocation(req: Request, res: Response) {
  try {
    const userID = (req as any).user.id;

    //retrieve user profile location from DB
    const profileLocation = await prisma.userLocation.findUnique({
      where: { user_id: userID },
    });

    if (!profileLocation) {
      return res.error("NOT_FOUND", "Profile location not found!", 404);
    }

    res.success(profileLocation, "Profile location retrieved Successfully");
  } catch (error) {
    return res.error(
      "INTERNAL_SERVER_ERROR",
      "Something went wrong" + error,
      500
    );
  }
}
