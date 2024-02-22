import React, { useState, useEffect } from 'react';
import Post from './post';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/posts')
      .then(response => response.json())
      .then(data => {
        setPosts(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching posts:', error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {posts.map(post => (
        <Post key={post.postid} url={`/api/v1/posts/${post.postid}`} />
      ))}
    </div>
  );
}

export default Feed;
