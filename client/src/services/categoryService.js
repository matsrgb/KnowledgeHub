import axios from 'axios';

const API_URL = 'http://localhost:5000/api/categories';

const getCategories = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const createCategory = async (categoryData) => {
    const response = await axios.post(API_URL, categoryData);
    return response.data;
};

export default {
    getCategories,
    createCategory,
};
