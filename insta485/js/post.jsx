import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
dayjs.extend(relativeTime);
dayjs.extend(utc);

// The parameter of this function is an object with a string called url inside it.
// url is a prop for the Post component.
export default function Post({ url }) {
  /* Display image and post owner of a single post */
  const [imgUrl, setImgUrl] = useState("");
  const [owner, setOwner] = useState("");
  const [ownerImgUrl, setOwnerImgUrl] = useState("");
  const [ownerShowUrl, setOwnerShowUrl] = useState("");
  const [postShowUrl, setPostShowUrl] = useState("");
  const [comments, setComments] = useState([{}]);
  const [likes, setLikes] = useState({});
  const [created, setCreated] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentEntry, setCommentEntry] = useState("");
  const [postid, setPostId] = useState(0);

  const commentItems = comments.map(comment =>
    comment.text && comment.ownerShowUrl && comment.owner && comment.commentid && <div
      key={comment.commentid}
    >
      <a href={comment.ownerShowUrl}>{comment.owner}</a>
      <span data-testid="comment-text">{comment.text}</span>
      {comment.lognameOwnsThis && comment.commentid && (
            <button data-testid="delete-comment-button" onClick={() => handleDeleteComment(comment.commentid)}>
              Delete comment
            </button>
        )}
    </div>
  );
  
  const likeText = likes['numLikes'] === 1 ? ' like' : ' likes';

  useEffect(() => {
    // Declare a boolean flag that we can use to cancel the API request.
    let ignoreStaleRequest = false;

    // Call REST API to get the post's information
    fetch(url, { credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        // If ignoreStaleRequest was set to true, we want to ignore the results of the
        // the request. Otherwise, update the state to trigger a new render.
        if (!ignoreStaleRequest) {
          setImgUrl(data.imgUrl);
          setOwner(data.owner);
          setOwnerImgUrl(data.ownerImgUrl);
          setOwnerShowUrl(data.ownerShowUrl);
          setPostShowUrl(data.postShowUrl);
          setComments(data.comments);
          setLikes(data.likes);
          setCreated(data.created);
          setPostId(data.postid);
        }
      })
      .catch((error) => console.log(error));

    return () => {
      // This is a cleanup function that runs whenever the Post component
      // unmounts or re-renders. If a Post is about to unmount or re-render, we
      // should avoid updating state.
      ignoreStaleRequest = true;
    };
  }, [url]);
  const handleDeleteComment = (commentid) =>{
    fetch('/api/v1/comments/' + commentid +'/', {
      credentials: "same-origin" , method: 'DELETE',
    })
    .then((response) => {
      if(!response.ok) throw Error(response.statusText);
      return response.text();
    })
    .then(data => {
      // Handle the data from the server
      setComments(comments.filter(comment => comment.commentid != commentid));
      console.log('Comment deleted:', data);
    })
    .catch(error => {
      // Handle any errors that occurred during the fetch
      console.error('There has been a problem with your fetch operation:', error);
    });

  }
  const handleCommentChange = (event) => {
    event.preventDefault();
    setCommentEntry(event.target.value);
  }

  const handleCommentSubmit = (event) => {
    event.preventDefault();
    //setCommentText(commentEntry);
    setCommentEntry("");
    fetch("/api/v1/comments/?postid=" + postid, {
      credentials: "same-origin" , method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Specify the content type as JSON
      },
      body: JSON.stringify({
        "text": commentEntry,
        "postid" : postid
      })
    })
    .then((response) => {
      if(!response.ok) throw Error(response.statusText);
      return response.json();
    })
    .then(data => {
      setComments(comments.concat(data));
    })
    .catch(error => {
      // Handle any errors that occurred during the fetch
      console.error('There has been a problem with your fetch operation:', error);
    });

  };
  // Render post image and post owner
  return (
    <div className="post">
      <div>
        {owner && ownerShowUrl && (<a href={ownerShowUrl}>{owner}</a>)}
        {owner && ownerShowUrl && ownerImgUrl && (<a href={ownerShowUrl}>{<img src={ownerImgUrl} alt="owner_image" />}</a>)}
        {created && (<div>{dayjs.utc(created).local().fromNow()}</div>)}
      </div>
        {postShowUrl && imgUrl && (<a href={postShowUrl}>{<img src={imgUrl} alt="post_image" />}</a>)}
      <div>
        {likes && (<div>{likes['numLikes']}</div>)}
        {likes && (<div>{likeText}</div>)}
        {comments && (<div>{commentItems}</div>)}
        {postid && <form data-testid="comment-form" onSubmit={handleCommentSubmit} >
          <label><input type="text" value = {commentEntry} onChange={handleCommentChange} /></label>
        </form>}
        {commentText && owner && ownerShowUrl && <span data-testid="comment-text" >{<a href={ownerShowUrl}>{owner}</a>}{commentText}
        </span>}
      </div>
    </div>
  );
}

Post.propTypes = {
  url: PropTypes.string.isRequired,
};