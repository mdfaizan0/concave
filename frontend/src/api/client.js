import { supabase } from "@/lib/supabase"
import axios from "axios"

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
})

let accessToken = null;

supabase.auth.onAuthStateChange((_event, session) => {
    accessToken = session?.access_token ?? null;
});

apiClient.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// Response interceptors for global guardrails
apiClient.interceptors.response.use(
    (response) => {
        // Success: return response as-is (preserving payload exactly)
        return response;
    },
    (error) => {
        // Error: never swallow, normalize only at toast layer
        // This ensures the caller gets the full error context
        return Promise.reject(error);
    }
);

export default apiClient