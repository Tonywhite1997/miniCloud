import React from "react";

interface AudioType {
  audioURL: string;
  type: string;
}

function AudioPlayer({ audioURL, type }: AudioType) {
  return (
    <div>
      <audio controls>
        <source src={audioURL} type={type} />
        Your browser does not support the audio tag.
      </audio>
    </div>
  );
}

export default AudioPlayer;
