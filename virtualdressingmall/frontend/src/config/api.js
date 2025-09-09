// Configuration for API endpoints
const API_CONFIG = {
    BASE_URL: "http://localhost:10000",
    API_PATH: "/api"
};

// Full API URL
export const API_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PATH}`;

// Just the base URL for other uses
export const BASE_URL = API_CONFIG.BASE_URL;

export default API_CONFIG;
