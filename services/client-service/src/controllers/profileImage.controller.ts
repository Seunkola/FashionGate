import { Request, Response } from "express";
import { prisma } from "@/services/prismaClient";
import { supabase } from "@/services/supabaseClient";

export async function uploadProfileImage(req: Request, res: Response) {
  try {
    const userID = (req as any).user.id;
    const image = req.file;

    if (!image) {
      return res.error("BAD_REQUEST", "No file uploaded", 400);
    }

    // upload image to blob storage
    const { originalname, buffer } = image;

    const { error } = await supabase.storage
      .from(process.env.STORAGE_BUCKET as string)
      .upload(`${userID}/${originalname}`, buffer, {
        cacheControl: "3600",
        upsert: true,
        contentType: image.mimetype,
      });

    if (error) {
      return res.error(
        "UPLOAD_FAILED",
        "Failed to upload image" + error.message,
        500
      );
    }

    // get public url of the uploaded image
    const publicUrl = supabase.storage
      .from(process.env.STORAGE_BUCKET as string)
      .getPublicUrl(`${userID}/${originalname}`).data.publicUrl;

    // update user's profile with the image url
    const updateProfileImageUrl = await prisma?.user.update({
      where: { id: userID },
      data: { profile_image_url: publicUrl },
    });

    if (!updateProfileImageUrl) {
      return res.error(
        "UPDATE_FAILED",
        "Failed to update profile with image url",
        500
      );
    }

    return res.success({ profileImageUrl: publicUrl });
  } catch (error) {
    return res.error(
      "INTERNAL_SERVER_ERROR",
      "Something went wrong" + error,
      500
    );
  }
}

export async function deleteProfileImage(req: Request, res: Response) {
  try {
    const userID = (req as any).user.id;

    // get current profile image url
    const user = await prisma?.user.findUnique({
      where: { id: userID },
    });

    // check if user has a profile image
    if (!user || !user.profile_image_url) {
      return res.error("NOT_FOUND", "No profile image to delete", 404);
    }

    // get image path from url
    const bucket = process.env.STORAGE_BUCKET as string;
    const imageUrl = user.profile_image_url;
    const imagePath = imageUrl.split(`/${bucket}/`)[1];

    if (!imagePath) {
      return res.error(
        "INTERNAL_SERVER_ERROR",
        "Error parsing image path",
        500
      );
    }

    // delete image from blob storage
    const { error } = await supabase.storage.from(bucket).remove([imagePath]);

    if (error) {
      return res.error("INTERNAL_SERVER_ERROR", "Failed to delete image", 500);
    }

    // remove image url from user's profile
    const updateProfileImageUrl = await prisma?.user.update({
      where: { id: userID },
      data: { profile_image_url: null },
    });

    if (!updateProfileImageUrl) {
      return res.error(
        "INTERNAL_SERVER_ERROR",
        "Failed to remove image url from profile",
        500
      );
    }

    return res.success({ message: "Profile image deleted successfully" });
  } catch (error) {
    return res.error(
      "INTERNAL_SERVER_ERROR",
      "Something went wrong" + error,
      500
    );
  }
}
