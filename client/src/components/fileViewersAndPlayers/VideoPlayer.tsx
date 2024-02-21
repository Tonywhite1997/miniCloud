import React from "react";

interface VideoType {
  videoURL: string;
  windowSize: {
    height: number;
    width: number;
  };
  type: string;
}

function VideoPlayer({ videoURL, windowSize, type }: VideoType): JSX.Element {
  return (
    <div>
      <video width={windowSize.width} height={windowSize.height} controls>
        <source src={videoURL} type={type}></source>
        {/* <source src={videoURL} type="video/ogg"></source> */}
        {/* <source src={videoURL} type="video/mp4"></source>
        <source src={videoURL} type="video/webm"></source> */}
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default VideoPlayer;
