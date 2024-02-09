import React from "react";

function VideoPlayer({ videoURL, windowSize }) {
  return (
    <div>
      <video width={windowSize.width} height={windowSize.height} controls>
        <source src={videoURL} type="video/ogg"></source>
        <source src={videoURL} type="video/mp4"></source>
        <source src={videoURL} type="video/webm"></source>
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default VideoPlayer;
