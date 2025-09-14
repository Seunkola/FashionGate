import { ApiResponse } from "./types";

export function createApiResponse(success: boolean, message: string, data?: any, error?: string):
    ApiResponse {
    return {
        success,
        message,
        data,
        error,
    };
}