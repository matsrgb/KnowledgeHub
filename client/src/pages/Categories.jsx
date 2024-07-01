import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';
import { UserContext } from '../context/userContext';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { currentUser } = useContext(UserContext);
    const token = currentUser?.token;

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/categories`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCategories(response.data);
            } catch (error) {
                console.log(error);
            }
            setIsLoading(false);
        };

        fetchCategories();
    }, [token]);

    if (isLoading) {
        return <Loader />;
    }

    const removeCategory = async (categoryId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BASE_URL}/categories/${categoryId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(categories.filter(category => category._id !== categoryId));
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <section className="categories">
            {categories.length ? (
                <div className="container categories__container">
                    {categories.map(category => (
                        <article key={category._id} className="categories__category">
                            <div className='categories__category-info'>
                                <h5>{category.name}</h5>
                                <p>{category.description}</p>
                            </div>
                            <div className="categories__category-actions">
                                <Link to={`/categories/${category._id}/edit`} className='btn primary sm'>Edit</Link>
                                <button onClick={() => removeCategory(category._id)} className='btn danger sm'>Delete</button>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <h2 className='center'>No categories found.</h2>
            )}
        </section>
    );
};

export default Categories;
