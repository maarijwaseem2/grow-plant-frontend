// Single source for backend URL — change only in .env
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const UPLOADS_URL = `${API_BASE_URL}/uploads/`;

// Smart image URL: base64 data URLs and full http URLs are used as-is;
// bare filenames get the uploads path prepended.
export const imgUrl = (image) => {
  if (!image) return "";
  const s = String(image);
  if (s.startsWith("data:") || s.startsWith("http")) return s;
  return `${UPLOADS_URL}${s}`;
};
