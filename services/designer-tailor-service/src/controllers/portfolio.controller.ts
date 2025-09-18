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
        include: {
          designer: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              profile_image_url: true,
            },
          },
          images: true, // Include portfolio images
          skills: {
            include: { skill: true }, // Include skill details
          },
          ratings: true, // Include ratings to calculate average
        },
        orderBy: { created_at: "desc" },
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
