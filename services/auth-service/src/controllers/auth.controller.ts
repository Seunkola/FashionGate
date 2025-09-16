import { Request, Response, NextFunction } from "express";
import { supabase, supabaseAdmin } from "../services/supabaseClient";
import { prisma } from "../services/prismaClient";

export async function signUp(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      email,
      password,
      displayName,
      profileImageUrl,
      firstName,
      lastName,
      roleName,
    } = req.body;

    //check for missing fields
    if (!email || !password || !displayName || !roleName) {
      return res.error(
        "MISSING_FIELDS",
        "Email, password, display name, and role name are required.",
        400
      );
    }

    // sign up user with Supabase Auth
    const { data: user, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { displayName },
      },
    });

    if (error) {
      return res.error("SIGNUP_FAILED", error.message, 400);
    }

    const userData = {
      id: user.user?.id,
      email: user.user?.email,
      displayName: user.user?.user_metadata?.displayName,
      accessToken: user.session?.access_token,
      refreshToken: user.session?.refresh_token,
      expiresAt: user.session?.expires_at,
      createdAt: user.user?.created_at,
      lastSignInAt: user.user?.last_sign_in_at,
    };

    /* Store additional user details in the 'users' table */
    // Fetch role by name
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      await supabaseAdmin.auth.admin.deleteUser(userData.id!);
      return res.error(
        "INVALID_ROLE",
        "The specified role does not exist.",
        400
      );
    }

    // Create user profile
    try {
      await prisma.user.create({
        data: {
          id: userData.id!,
          email: userData.email!,
          first_name: firstName || displayName,
          last_name: lastName,
          role_id: role.id,
          profile_image_url: profileImageUrl || null,
        },
      });
    } catch (dbErrror) {
      await supabaseAdmin.auth.admin.deleteUser(userData.id!);
      return res.error(
        "USER_CREATION_FAILED",
        "Failed to create user profile.",
        500
      );
    }

    return res.success(userData, "SIGNUP_SUCCESS");
  } catch (error) {
    return res.error(
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred.",
      500
    );
  }
}

export async function signIn(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.error(
        "MISSING_FIELDS",
        "Email and password are required.",
        400
      );
    }

    const { data: session, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.error("SIGNIN_FAILED", error.message, 401);
    }

    const userData = {
      id: session.user?.id,
      email: session.user?.email,
      displayName: session.user?.user_metadata?.displayName,
      accessToken: session.session?.access_token,
      refreshToken: session.session?.refresh_token,
      expiresAt: session.session?.expires_at,
      createdAt: session.user?.created_at,
      lastSignInAt: session.user?.last_sign_in_at,
    };
    return res.success(userData, "SIGNIN_SUCCESS");
  } catch (error) {
    return res.error(
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred.",
      500
    );
  }
}

export async function signOut(req: Request, res: Response, next: NextFunction) {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.error("SIGNOUT_FAILED", error.message, 400);
    }

    return res.success(null, "SIGNOUT_SUCCESS");
  } catch (error) {
    return next(error);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.error("MISSING_FIELDS", "Email is required", 400);
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.PASSWORD_RESET_REDIRECT_URL,
    });

    if (error) {
      return res.error("RESET_PASSWORD_FAILED", error.message, 400);
    }

    return res.success(data, "RESET_PASSWORD_EMAIL_SENT");
  } catch (error) {
    return next(error);
  }
}

export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { refresh_token } = req.body;
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      return res.error("TOKEN_REFRESH_FAILED", error.message, 401);
    }

    return res.success(data, "TOKEN_REFRESH_SUCCESS");
  } catch (error) {
    return next(error);
  }
}

export async function updatePassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { newPassword } = req.body;
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return res.error("UPDATE_PASSWORD_FAILED", error.message, 400);
    }

    return res.success(data, "UPDATE_PASSWORD_SUCCESS");
  } catch (error) {
    return next(error);
  }
}
