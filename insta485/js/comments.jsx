import React, { useState } from 'react'; // Ensure useState is imported
import PropTypes from 'prop-types';

export default function Comment({ initialComments, commentPostId }) {
  const [commentContent, setCommentContent] = useState(initialComments);
  const [commentEntry, setCommentEntry] = useState("");
  const postid = commentPostId;

  const handleDeleteComment = (id) => {
    fetch('/api/v1/comments/' + id +'/', {
      credentials: "same-origin", method: 'DELETE',
    })
    .then((response) => {
      if (!response.ok) throw Error(response.statusText);
      return response.text();
    })
    .then(data => {
      console.log('Comment deleted:', data);
      // Update state to remove the deleted comment
      setCommentContent(commentContent.filter(comment => comment.commentid !== id));
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
  };

  const handleCommentChange = (event) => {
    event.preventDefault();
    setCommentEntry(event.target.value);
  }

  const handleCommentSubmit = (event) => {
    event.preventDefault();
    setCommentEntry("");
    fetch("/api/v1/comments/?postid=" + postid, {
      credentials: "same-origin" , method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Specify the content type as JSON
      },
      body: JSON.stringify({
        "text": commentEntry,
        "postid": postid,
      })
    })
    .then((response) => {
      if(!response.ok) throw Error(response.statusText);
      return response.json();
    })
    .then(data => {
        setCommentContent(commentContent.concat(data));
    })
    .catch(error => {
      // Handle any errors that occurred during the fetch
      console.error('There has been a problem with your fetch operation:', error);
    });

  };

  // Here we use commentContent, which is the up-to-date state of our comments
  const commentItems = commentContent.map(comment =>
    comment.text && comment.ownerShowUrl && comment.owner && comment.commentid && (
      <div key={comment.commentid}>
        <a href={comment.ownerShowUrl}>{comment.owner}</a>
        <span data-testid="comment-text">{comment.text}</span>
        {comment.lognameOwnsThis && comment.commentid && (
          <button
            data-testid="delete-comment-button"
            onClick={() => handleDeleteComment(comment.commentid)}
          >
            Delete comment
          </button>
        )}
      </div>
    )
  );

  return (
    <div>{commentItems}
        <form data-testid="comment-form" onSubmit={handleCommentSubmit} >
            <label><input type="text" value = {commentEntry} onChange={handleCommentChange} /></label>
        </form>
    </div>

  );
}

Comment.propTypes = {
    initialComments: PropTypes.array.isRequired,
    commentPostId: PropTypes.number.isRequired,
};