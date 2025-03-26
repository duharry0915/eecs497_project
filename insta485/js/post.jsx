import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom"; // 🔹 Added useHistory for navigation
import InfiniteScroll from "react-infinite-scroll-component";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import Comment from "./comments";
import Like from "./like";

dayjs.extend(relativeTime);
dayjs.extend(utc);

export default function Post({ url }) {
  const navigate = useNavigate(); // 🔹 Enables navigation without reloading
  const currentUrl = useRef(url);
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  // 🔹 Function to fetch posts from API
  const fetchposts = () => {
    fetch(currentUrl.current, { credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        setHasMore(!!data.next);
        if (data.next) currentUrl.current = data.next;

        // 🔹 Fetch detailed post data from individual post URLs
        const contents = data.results.map((post) =>
          fetch(post.url, { credentials: "same-origin" })
            .then((response) => {
              if (!response.ok) throw Error(response.statusText);
              return response.json();
            })
            .catch((error) => console.log(error)),
        );
        return Promise.all(contents);
      })
      .then((contents) => {
        setPosts((prevPosts) => {
          const uniqueId = new Set(prevPosts.map((post) => post.postid));
          const newPosts = contents.filter(
            (post) => !uniqueId.has(post.postid),
          );
          return [...prevPosts, ...newPosts];
        });
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchposts(); // 🔹 Calls fetch function when component mounts
  }, []);

  return (
    <div className="post">
      {/* 🔹 Added Tarot Reading Navigation Button */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={() => navigate.push("/tarot/shuffling")} // 🔹 Redirects to Tarot page
          style={{
            backgroundColor: "#8B5CF6", // 🔹 Purple aesthetic button
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

      {/* 🔹 Infinite Scrolling for Posts */}
      <InfiniteScroll
        dataLength={posts.length}
        next={fetchposts} // 🔹 Fetches more posts when user scrolls down
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
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
                {" "}
                {dayjs.utc(post.created).local().fromNow()}
              </a>
            </div>
            {/* 🔹 Like Button Component */}
            <Like
              postImgUrl={post.imgUrl}
              initiallikeDetail={post.likes}
              postid={post.postid}
            />
            {/* 🔹 Comment Section Component */}
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
