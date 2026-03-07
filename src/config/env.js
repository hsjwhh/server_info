// src/config/env.js
// Unified API base URL for all frontend HTTP calls.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
