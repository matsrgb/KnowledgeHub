import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PostItem from '../components/PostItem';
import Loader from '../components/Loader';

const CategoryPosts = () => {
    const { category } = useParams();
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts/categories/${category}`);
                console.log("Fetched category posts:", response.data); // Log fetched posts
                setPosts(response.data);
            } catch (error) {
                console.log("Error fetching category posts:", error.response ? error.response.data : error.message);
            }
            setIsLoading(false);
        };
        fetchPosts();
    }, [category]);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <section className="category-posts">
            {posts.length ? (
                <div className="container posts__container">
                    {posts.map(({ _id: id, thumbnail, category, title, description, creator, createdAt }) => (
                        <PostItem
                            key={id}
                            postID={id}
                            thumbnail={thumbnail}
                            category={category.name} // Assuming the populated category has a 'name' field
                            title={title}
                            description={description}
                            authorID={creator}
                            createdAt={createdAt}
                        />
                    ))}
                </div>
            ) : (
                <h2 className="center">No Posts found for {category}.</h2>
            )}
        </section>
    );
};

export default CategoryPosts;
