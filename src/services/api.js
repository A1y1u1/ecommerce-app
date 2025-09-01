import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

export const getProducts = () => api.get('/products');
export const getProduct = (id) => api.get(`/products/${id}`);
export const getCategories = () => api.get('/categories');
export const getUsers = () => api.get('/users');
// Add more API methods as needed

export default api;