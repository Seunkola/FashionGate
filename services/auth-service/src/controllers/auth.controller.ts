import { Request, Response, NextFunction } from "express";
import { supabase } from "../services/supabaseClient";

export async function signUp(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, displayName } = req.body;
    const { data: user, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { displayName },
      },
    });

    if (error){
        return res.error("SIGNUP_FAILED", error.message, 400);
    }

    return res.success(user, "SIGNUP_SUCCESS");
  } catch (error) {
    return next(error);
  }
};

export async function signIn(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;
        const { data: session, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.error("SIGNIN_FAILED", error.message, 401);
        }

        return res.success(session, "SIGNIN_SUCCESS");
    } catch (error) {
        return next(error);
    }
};

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
};

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
        const { email } = req.body;
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: process.env.PASSWORD_RESET_REDIRECT_URL
        });

        if (error) {
            return res.error("RESET_PASSWORD_FAILED", error.message, 400);
        }

        return res.success(data, "RESET_PASSWORD_EMAIL_SENT");
    }
    catch (error) {
        return next(error);
    }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
        const { refresh_token } = req.body;
        const { data, error } = await supabase.auth.refreshSession({
            refresh_token
        });

        if (error) {
            return res.error("TOKEN_REFRESH_FAILED", error.message, 401);
        }

        return res.success(data, "TOKEN_REFRESH_SUCCESS");
    } catch (error) {
        return next(error);
    }
}

export async function updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
        const { newPassword } = req.body;
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            return res.error("UPDATE_PASSWORD_FAILED", error.message, 400);
        }

        return res.success(data, "UPDATE_PASSWORD_SUCCESS");
    }
    catch (error) {
        return next(error);
    }
}

