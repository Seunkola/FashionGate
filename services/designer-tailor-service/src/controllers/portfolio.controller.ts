import { Request, Response } from "express";
import { prisma } from "@/services/prismaClient";
import { supabase } from "@/services/supabaseClient";

export async function createPortfolio(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    let { title, description, skills } = req.body;
    const imageFiles = (req as any).files;

    if (!imageFiles || imageFiles.length === 0) {
      return res.error("BAD_REQUEST", "At least one image is required", 400);
    }

    if (!title) {
      return res.error("BAD_REQUEST", "Title is required", 400);
    }

    //parse skills if sent as string
    if (typeof skills === "string") {
      try {
        skills = JSON.parse(skills);
      } catch (e) {
        return res.error(
          "BAD_REQUEST",
          "Skills must be a valid JSON array",
          400
        );
      }
    }

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.error("BAD_REQUEST", "At least one skill is required", 400);
    }

    //Run all tasks in a transaction
    const portfolio = await prisma.$transaction(async (prismaTransaction) => {
      //create portfolio
      const portfolio = await prismaTransaction.portfolio.create({
        data: {
          designer_id: user.id,
          title,
          description,
        },
      });

      // Add skills to portfolio
      await prismaTransaction.portfolioSkill.createMany({
        data: skills.map((skill: string) => ({
          portfolio_id: portfolio.id,
          skill_id: skill,
        })),
      });

      // Upload images to supabase storage and create portfolio images
      for (const file of imageFiles) {
        const { originalname, buffer } = file;

        const { error } = await supabase.storage
          .from(process.env.STORAGE_BUCKET as string)
          .upload(`${portfolio.id}/${originalname}`, buffer, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (error) {
          return res.error(
            "INTERNAL_SERVER_ERROR",
            "Error uploading image",
            500
          );
        }

        const publicImageUrl = supabase.storage
          .from(process.env.STORAGE_BUCKET as string)
          .getPublicUrl(`${portfolio.id}/${originalname}`).data.publicUrl;

        // Save image record in the database
        if (publicImageUrl) {
          const portfolioImageData =
            await prismaTransaction.portfolioImage.create({
              data: {
                portfolio_id: portfolio.id,
                image_url: publicImageUrl,
              },
            });

          if (!portfolioImageData) {
            return res.error(
              "INTERNAL_SERVER_ERROR",
              "Error saving image record",
              500
            );
          }
        }
      }
      return portfolio;
    });
    return res.success({ portfolio }, "Portfolio created successfully");
  } catch (error) {
    return res.error("INTERNAL_SERVER_ERROR", "Something went wrong", 500);
  }
}

export async function getPortfolios(req: Request, res: Response) {
  try {
    // default pagination values
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [portfolios, total] = await Promise.all([
      prisma.portfolio.findMany({
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          designer: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              profile_image_url: true,
            },
          },
          images: {
            take: 1,
            select: { image_url: true },
          },
          skills: {
            select: {
              skill: { select: { name: true } },
            },
          },
          ratings: {
            select: { rating: true },
          },
        },
      }),
      prisma.portfolio.count(),
    ]);

    // If no portfolios found, return empty array
    if (total === 0) {
      return res.success({ portfolios: [] }, "No Portfolios Available");
    }

    return res.success(
      {
        portfolios,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Portfolios retrieved successfully"
    );
  } catch (error) {
    return res.error("INTERNAL_SERVER_ERROR", "Something went wrong", 500);
  }
}

export async function getPortfolioById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.error("BAD_REQUEST", "Portfolio ID is required", 400);
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
      include: {
        designer: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_image_url: true,
            email: true,
          },
        },
        images: true, // Include portfolio images
        skills: {
          include: { skill: true }, // Include skill details
        },
        ratings: true, // Include ratings to calculate average
      },
    });

    if (!portfolio) {
      return res.error("NOT_FOUND", "Portfolio not found", 404);
    }

    // Calculate average rating
    const averageRating = portfolio.ratings.length
      ? portfolio.ratings.reduce((sum, r) => sum + r.rating, 0) /
        portfolio.ratings.length
      : null;

    return res.success(
      { portfolio: { ...portfolio, averageRating } },
      "Portfolio retrieved successfully"
    );
  } catch (error) {
    return res.error("INTERNAL_SERVER_ERROR", "Something went wrong", 500);
  }
}

export async function updatePortfolio(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    let { title, description, skills } = req.body;
    const imageFiles = (req as any).files;

    //check if id is provided
    if (!id) {
      return res.error("BAD_REQUEST", "Portfolio ID is required", 400);
    }

    //check if at least one field to update is provided
    // Normalize
    const hasTitle = typeof title === "string" && title.trim().length > 0;
    const hasDescription =
      typeof description === "string" && description.trim().length > 0;
    const hasSkills = Array.isArray(skills) && skills.length > 0;
    const hasImages = Array.isArray(imageFiles) && imageFiles.length > 0;
    if (!hasTitle && !hasDescription && !hasSkills && !hasImages) {
      return res.error(
        "BAD_REQUEST",
        "At least one field must be provided",
        400
      );
    }

    //check if portfolio exists and belongs to user
    const existingPortfolio = await prisma.portfolio.findUnique({
      where: { id },
    });
    if (!existingPortfolio) {
      return res.error("NOT_FOUND", "Portfolio not found", 404);
    }
    if (existingPortfolio.designer_id !== user.id) {
      return res.error(
        "FORBIDDEN",
        "You can only update your own portfolios",
        403
      );
    }

    //update fields if provided
    const updatedPortfolio = await prisma.portfolio.update({
      where: { id },
      data: {
        title: title || existingPortfolio.title,
        description: description || existingPortfolio.description,
      },
    });

    /* Update skills if provided */

    //parse skills if sent as string
    if (typeof skills === "string") {
      try {
        skills = JSON.parse(skills);
      } catch (e) {
        return res.error(
          "BAD_REQUEST",
          "Skills must be a valid JSON array",
          400
        );
      }
    }

    // If skills is provided and is a non-empty array, update skills
    if (skills && Array.isArray(skills) && skills.length > 0) {
      // Delete existing skills
      await prisma.portfolioSkill.deleteMany({
        where: { portfolio_id: id },
      });

      // Add new skills
      await prisma.portfolioSkill.createMany({
        data: skills.map((skillId: string) => ({
          portfolio_id: id,
          skill_id: skillId,
        })),
      });
    }
    /* End Update skills */

    /* Add new images if provided */
    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        const { originalname, buffer } = file;
        const { error } = await supabase.storage
          .from(process.env.STORAGE_BUCKET as string)
          .upload(`${id}/${originalname}`, buffer, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (error) {
          return res.error(
            "INTERNAL_SERVER_ERROR",
            "Error uploading image",
            500
          );
        }

        const publicImageUrl = supabase.storage
          .from(process.env.STORAGE_BUCKET as string)
          .getPublicUrl(`${id}/${originalname}`).data.publicUrl;

        // Save image record in the database
        if (publicImageUrl) {
          await prisma.portfolioImage.create({
            data: {
              portfolio_id: id,
              image_url: publicImageUrl,
            },
          });
        }
      }
    } /* End Add new images */

    return res.success(
      { portfolio: updatedPortfolio },
      "Portfolio updated successfully"
    );
  } catch (error) {
    return res.error("INTERNAL_SERVER_ERROR", "Something went wrong", 500);
  }
}

export async function deletePortfolio(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!portfolio) {
      return res.error("NOT_FOUND", "Portfolio not found", 404);
    }

    // Check if the portfolio belongs to the authenticated user
    if (portfolio.designer_id !== user.id) {
      return res.error(
        "FORBIDDEN",
        "You can only delete your own portfolios",
        403
      );
    }

    // Delete images from Supabase storage
    if (portfolio.images && portfolio.images.length > 0) {
      const paths = portfolio.images.map(
        (img) => `${id}/${img.image_url.split("/").pop()}`
      );

      const { error } = await supabase.storage
        .from(process.env.STORAGE_BUCKET as string)
        .remove(paths);

      if (error) {
        return res.error(
          "INTERNAL_SERVER_ERROR",
          "Error deleting images from storage",
          500
        );
      }
    }

    // delete portfolio and associated records in a transaction with cascade
    await prisma.portfolio.delete({
      where: { id },
    });

    return res.success({}, "Portfolio deleted successfully");
  } catch (error) {
    return res.error("INTERNAL_SERVER_ERROR", "Something went wrong", 500);
  }
}

export async function deletePortfolioImage(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { portfolioId, imageId } = req.params;

    if (!portfolioId && !imageId) {
      return res.error(
        "BAD_REQUEST",
        "Portfolio ID and Image ID are required",
        400
      );
    }

    // Check if portfolio exists and belongs to user
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      select: { designer_id: true },
    });

    if (!portfolio) {
      return res.error("NOT_FOUND", "Portfolio not found", 404);
    }

    if (portfolio.designer_id !== user.id) {
      return res.error(
        "FORBIDDEN",
        "You can only delete images from your own portfolios",
        403
      );
    }

    // Check if image exists and belongs to portfolio
    const image = await prisma.portfolioImage.findFirst({
      where: { id: imageId, portfolio_id: portfolioId },
    });

    if (!image) {
      return res.error("NOT_FOUND", "Image not found in portfolio", 404);
    }

    const bucket = process.env.STORAGE_BUCKET as string;
    const imageUrl = image.image_url;
    const imagePath = imageUrl.split(`${bucket}/`)[1];

    if (!imagePath) {
      return res.error(
        "INTERNAL_SERVER_ERROR",
        "Error parsing image path",
        500
      );
    }

    // Delete image from Supabase storage
    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([imagePath]);

    if (storageError) {
      return res.error(
        "INTERNAL_SERVER_ERROR",
        "Error deleting image from storage",
        500
      );
    }

    // Delete image record from database
    await prisma.$transaction(async (prismaTransaction) => {
      await prismaTransaction.portfolioImage.delete({
        where: { id: imageId },
      });
    });

    return res.success({}, "Image deleted successfully");
  } catch (error) {
    return res.error("INTERNAL_SERVER_ERROR", "Something went wrong", 500);
  }
}
