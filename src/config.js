// Single source for backend URL — change only in .env
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const UPLOADS_URL = `${API_BASE_URL}/uploads/`;
