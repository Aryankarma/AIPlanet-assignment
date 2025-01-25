import axios from 'axios';

const myAxios = axios.create({
  baseURL: process.env.BASE_URL || 'http://localhost:8000',
  withCredentials: true,
});

export default myAxios;