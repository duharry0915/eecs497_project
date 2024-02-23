import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

export default function Like({postImgUrl, initiallikeDetail, postid}) {
  console.log(initiallikeDetail["numLikes"]);
  const [logLike, setLogLike] = useState(initiallikeDetail["logNameLikesThis"]);
  const [numLike, setNumLike] = useState(initiallikeDetail['numLikes']);
  const postId = postid;
  const likeText = numLike === 1 ? ' like' : ' likes';
  const handleClickLike=()=>{
    if(!initiallikeDetail["logNameLikesThis"]){
      fetch("/api/v1/likes/?postid=" + postId, {
        credentials: "same-origin" , method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "postid": postId,
        })
      })
      .then((response) => {
        if(!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then(data => {
        setLogLike(logLike=>(!logLike));
        setNumLike(numLike=>(numLike + 1))
      })
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      });
    }
    else{

    }
  };
  return (
    <div>
      <img src={postImgUrl} alt="post_image" />
      <div>{numLike}{likeText}</div>
      <button data-testid="like-unlike-button" onClick = {handleClickLike}>
      {logLike === true ? 'Unlike' : "Like"}
      </button>
    </div>
  );
}

Like.propTypes = {
  postImgUrl: PropTypes.string.isRequired,
  initiallikeDetail: PropTypes.object.isRequired,
  postid: PropTypes.number.isRequired,
};
