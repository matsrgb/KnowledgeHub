import React, { useEffect, useState } from 'react';
import PostItem from './PostItem';
import axios from 'axios';
import Loader from './Loader';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts`);
        console.log(response.data, "response")
        setPosts(response?.data);
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    };

    fetchPosts();
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <section className="posts">
      {posts.length ? (
        <div className="container posts__container">
          {posts.map(({ _id: id, thumbnail, category, title, description, creator, createdAt }) => (
            <PostItem
              key={id}
              postID={id}
              thumbnail={thumbnail}
              category={category?.name} // Pass the category name
              title={title}
              description={description}
              authorID={creator}
              createdAt={createdAt}
            />
          ))}
        </div>
      ) : (
        <h2 className="center">No Posts Found.</h2>
      )}
    </section>
  );
};

export default Posts;
