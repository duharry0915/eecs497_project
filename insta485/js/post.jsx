import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import Comment from "./comments";
import Like from "./like";

dayjs.extend(relativeTime);
dayjs.extend(utc);

export default function Post({ url }) {
  const navigate = useNavigate();
  const currentUrl = useRef(url);
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [username, setUsername] = useState(""); // State to store the username

  // Function to fetch username from API
  const fetchUsername = () => {
    fetch("/api/v1/posts/", { credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        setUsername(data.username);
      })
      .catch((error) => console.log(error));
  };

  // Function to fetch posts from API
  const fetchPosts = () => {
    fetch(currentUrl.current, { credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        // Implement post-fetching logic here
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchUsername(); // Fetch username when component mounts
    // fetchPosts(); // Fetch posts when component mounts
  }, []);

  return (
    <div className="post">
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/tarot/shuffling")}
          style={{
            backgroundColor: "#8B5CF6",
            color: "white",
            padding: "10px 20px",
            fontSize: "18px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Try a Tarot Reading 🔮
        </button>
      </div>

      <InfiniteScroll
        dataLength={posts.length}
        next={fetchPosts}
        hasMore={hasMore}
        loader={<h4>Welcome, {username}!</h4>} // Display the username in the loader
        scrollThreshold={1}
      >
        {posts.map((post) => (
          <div key={post.postid}>
            <div>
              <a href={post.ownerShowUrl}>
                <img src={post.ownerImgUrl} alt="owner_img" />
                <div>{post.owner}</div>
              </a>
              <a href={post.postShowUrl}>
                {dayjs.utc(post.created).local().fromNow()}
              </a>
            </div>
            <Like
              postImgUrl={post.imgUrl}
              initiallikeDetail={post.likes}
              postid={post.postid}
            />
            <Comment
              initialComments={post.comments}
              commentPostId={post.postid}
            />
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
}

Post.propTypes = {
  url: PropTypes.string.isRequired,
};