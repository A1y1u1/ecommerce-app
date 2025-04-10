import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export const getProducts = () => api.get('/api/products');
export const getProduct = (id) => api.get(`/api/products/${id}`);
export const getCategories = () => api.get('/api/categories');
export const getUsers = () => api.get('/api/users');
// Add more API methods as needed

export default api;