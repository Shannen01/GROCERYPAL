import axios from 'axios';

const API_URL = 'http://localhost:3000';

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

export const register = async (userData) => {
    try {
        const response = await axios.post('/api/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error;
    }
}; 