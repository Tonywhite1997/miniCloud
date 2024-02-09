import React from "react";

function AudioPlayer({ audioURL }) {
  return (
    <div>
      <audio controls>
        <source src={audioURL} type="audio/mpeg" />
        <source src={audioURL} type="audio/wav" />
        <source src={audioURL} type="audio/ogg" />
        <source src={audioURL} type="audio/aac" />
        <source src={audioURL} type="audio/mp4" />
        Your browser does not support the audio tag.
      </audio>
    </div>
  );
}

export default AudioPlayer;
