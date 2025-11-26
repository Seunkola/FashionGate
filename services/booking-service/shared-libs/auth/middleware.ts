import { Response, Request, NextFunction } from "express";
import { ApiResponse } from "./types";

declare global {
  namespace Express {
    interface Response {
      success<T>(data: T, message?: string): this;
      error(message: string, error?: string, statusCode?: number): this;
    }
  }
}

export function responseMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
    res.success = function <T>(data: T, message: string = "Success", statusCode = 200){
        const payload: ApiResponse = {
            success: true,
            message,
            data
        };
        return this.status(statusCode).json(payload);
    };

    res.error = function (message: string, error?: string, statusCode: number = 500){
        const payload: ApiResponse = {
            success: false,
            message,
            error,
            errorcode: statusCode
        };
        return this.status(statusCode).json(payload);
        
    };
    
    next();
}
