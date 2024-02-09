import React from "react";

function ImageViewer({ imageURL }) {
  return (
    <div className="file">
      <img src={imageURL} />
    </div>
  );
}

export default ImageViewer;
