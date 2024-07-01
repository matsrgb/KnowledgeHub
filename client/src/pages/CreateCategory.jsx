import React, { useState } from 'react';
import categoryService from '../services/categoryService';

const CreateCategory = () => {
    const [name, setName] = useState('');
   
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await categoryService.createCategory({ name });
            setMessage('Category created successfully!');
            setName('');
           
        } catch (error) {
            setMessage('Failed to create category.');
        }
    };

    return (
        <section className="create-category">
            <div className="container">
                <h2>Create New Category</h2>
                {message && <p className="form__message">{message}</p>}
                <form onSubmit={handleSubmit} className='form create-category__form'>
                    <input
                        type="text"
                        placeholder='Category Name'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                   
                    <button type="submit" className='btn primary'>Create Category</button>
                </form>
            </div>
        </section>
    );
};

export default CreateCategory;
