import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import InfiniteScroll from "react-infinite-scroll-component";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import Comment from "./comments";
import Like from "./like";
dayjs.extend(relativeTime);
dayjs.extend(utc);

export default function Post({ url }) {
    const currentUrl = useRef(url);
    const [posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const fetchposts = () => {
        fetch(currentUrl.current, { credentials: "same-origin" })
        .then(response => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        })
        .then(data => {
            setHasMore(!!data.next);
            if(data.next) currentUrl.current = data.next;
            const contents = data.results.map(post =>
                fetch(post.url, { credentials: "same-origin" })
                    .then((response) => {
                        if (!response.ok) throw Error(response.statusText);
                        return response.json();
                    })
                    .catch((error) => console.log(error))
            );            
            return Promise.all(contents);
        })
        .then(contents=> {
            setPosts(prevPosts => {
                const uniqueId = new Set(prevPosts.map(post => post.postid));
                const newPosts = contents.filter(post => !uniqueId.has(post.postid));
                return [...prevPosts,...newPosts];
            });
        })
        .catch(error => console.log(error));
    };
    useEffect(() => fetchposts, []);
    return (
        <div className="post">
        <InfiniteScroll
            dataLength={posts.length}
            next={fetchposts}
            hasMore={hasMore}
            loader={<h4>Loading...</h4>}
            scrollThreshold={1}
        >
            {posts.map((post) => (
            <div key={post.postid}>
              <div > 
                <a href={post.ownerShowUrl}>
                    <img src={post.ownerImgUrl} alt="owner_img"/>
                    <div>{post.owner}</div>
                </a>
                <a href={post.postShowUrl}> {dayjs.utc(post.created).local().fromNow()}</a>
                </div>
                <Like 
                    postImgUrl = {post.imgUrl}
                    initiallikeDetail = {post.likes}
                    postid = {post.postid}
                />
                <Comment 
                    initialComments = {post.comments}
                    commentPostId = {post.postid}
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