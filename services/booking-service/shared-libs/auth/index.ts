import { ApiResponse } from "./types";

export function createApiResponse(
    success: boolean, 
    message: string, 
    data?: any, 
    error?: string, 
    errorcode?: number
): ApiResponse {
    return {
        success,
        message,
        data,
        error,
        errorcode
    };
}

export const successResponse = (message: string, data?: any): ApiResponse => {
    return createApiResponse(true, message, data);
}

export const errorResponse = (message: string, error?: string, errorcode?: number): ApiResponse => {
    return createApiResponse(false, message, undefined, error, errorcode);
}

