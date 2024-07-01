import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/userContext';

const EditCategory = () => {
    const { id } = useParams();
    const [name, setName] = useState('');
   
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { currentUser } = useContext(UserContext);
    const token = currentUser?.token;

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }

        const fetchCategory = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/categories/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setName(response.data.name);
            
            } catch (error) {
                console.error("Error fetching category:", error.message);
                setMessage('Failed to fetch category.');
            }
        };

        fetchCategory();
    }, [id, token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`${process.env.REACT_APP_BASE_URL}/categories/${id}`, { name }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Category updated successfully!');
            navigate('/categories');
        } catch (error) {
            console.error("Error updating category:", error.message);
            setMessage('Failed to update category.');
        }
    };

    return (
        <section className="edit-category">
            <div className="container">
                <h2>Edit Category</h2>
                {message && <p>{message}</p>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Category Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                
                    <button type="submit">Update Category</button>
                </form>
            </div>
        </section>
    );
};

export default EditCategory;
