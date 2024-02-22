import React, { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import Post from "./post";
function PostsList({ url }) {
  const [posts, setPosts] = useState([{}])
  const [next, setNext] = useState(url)
  useEffect(() => {
    let ignoreStaleRequest = false;
    fetch(next, { credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        if (!ignoreStaleRequest) {
          setPosts([...posts, ...data.results]);
          setNext(data.next)
        }
      })
      .catch((error) => console.log(error));

    return () => {
      ignoreStaleRequest = true;
    };
  }, [next]);
  const postItems = posts.map(post =>
    post.url &&
    <div key={post.url}>
      <Post url={post.url} />
    </div>
  );
  return (
    <div>
      {posts && (<div>{postItems}</div>)}   
    </div>
  );
}

// Create a root
const root = createRoot(document.getElementById("reactEntry"));
// This method is only called once
// Insert the post component into the DOM
root.render(
  <StrictMode>
     <PostsList url = "/api/v1/posts/"/>
  </StrictMode>
);