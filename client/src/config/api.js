export const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:3001";

export const apiUrl = (path) => `${API_BASE}${path}`;