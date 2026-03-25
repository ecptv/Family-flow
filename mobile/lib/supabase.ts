import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cplbglwyplnmynrpjewx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwbGJnbHd5cGxubXlucnBqZXd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODQ4MzMsImV4cCI6MjA4ODY2MDgzM30.TSKg4CVbwkxReHvVy72swCylX96VSZ_xKT2WfHkHuzk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});