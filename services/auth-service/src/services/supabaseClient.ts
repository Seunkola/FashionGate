import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Regular client (for auth, user-facing requests)
//export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service client (admin actions: deleteUser, manage roles, etc.)
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
