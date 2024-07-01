import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { UserContext } from '../context/userContext';

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [thumbnail, setThumbnail] = useState(null); // Ensure thumbnail is initially null
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    const { currentUser } = useContext(UserContext);
    const token = currentUser?.token;

    // Redirect to login page for any user who lands on this page without token
    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    // Fetch categories from MongoDB
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/categories`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCategories(response.data);
            } catch (error) {
                setError('Failed to fetch categories.');
            }
        };
        fetchCategories();
    }, [token]);

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image'
    ];

    const createPost = async (e) => {
        e.preventDefault();

        if (!title || !category || !description || !thumbnail) {
            setError("Please fill in all fields and choose a thumbnail");
            console.log("Frontend validation failed: missing fields");
            console.log({ title, category, description, thumbnail });
            return;
        }

        const postData = new FormData();
        postData.set('title', title);
        postData.set('categoryId', category); // Ensure the correct field name is used here
        postData.set('description', description);
        postData.set('thumbnail', thumbnail);

        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/posts`, postData, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 201) {
                navigate('/');
            }
        } catch (err) {
            setError(err.response.data.message);
        }
    };

    return (
        <section className="create-post">
            <div className="container">
                <h2>Create Post</h2>
                {error && <p className="form__error-message">{error}</p>}
                <form onSubmit={createPost} className='form create-post__form' encType="multipart/form-data">
                    <input
                        type="text"
                        placeholder='Title'
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        autoFocus
                    />
                    <select
                        name='category'
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                    >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    <ReactQuill
                        modules={modules}
                        formats={formats}
                        value={description}
                        onChange={setDescription}
                    />
                    <input
                        type="file"
                        onChange={e => setThumbnail(e.target.files[0])}
                        accept="image/png, image/jpg, image/jpeg"
                    />
                    <button type="submit" className='btn primary'>Create</button>
                </form>
            </div>
        </section>
    );
};

export default CreatePost;
