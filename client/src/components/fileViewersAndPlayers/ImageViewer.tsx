import React from "react";

interface ImageLink {
  imageURL: string;
}

function ImageViewer({ imageURL }: ImageLink): JSX.Element {
  return (
    <div className="file">
      <img src={imageURL} />
    </div>
  );
}

export default ImageViewer;
