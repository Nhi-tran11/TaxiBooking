/**
 * Application Configuration
 * API URL is set via environment variable for deployment flexibility
 */

const config = {
  API_URL: import.meta.env.VITE_API_URL || 
           (import.meta.env.MODE === 'production' 
             ? 'https://taxibooking-l0t1.onrender.com' 
             : 'http://localhost:5000')
};

export default config;
