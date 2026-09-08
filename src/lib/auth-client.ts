import { createAuthClient } from "better-auth/react";

// Auth base URL: configured via VITE_API_URL env var at build time
// In production: set VITE_API_URL=https://hris.baitulquranalikhwan.cloud
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authClient = createAuthClient({
    baseURL: API_URL // backend HRIS-BQA
});
