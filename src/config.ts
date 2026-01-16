// This selects the correct backend automatically
const API_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL // In production (Vercel), use the real backend
  : 'http://localhost:8000';     // In development (Local), use localhost

export default API_URL;