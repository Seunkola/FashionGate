
export interface AuthUser {
    id: string; // Supabase user ID (UUID)
    email: string;
    role: string;
}

export interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}