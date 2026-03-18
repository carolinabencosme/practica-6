// API base URL is read from the environment variable VITE_API_URL.
// Set this variable in a .env file (copy from .env.example) before building or running locally.
// Example: VITE_API_URL=https://abc123.execute-api.us-east-1.amazonaws.com/prod
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default API_BASE_URL;
