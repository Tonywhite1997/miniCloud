import React from "react";

function PDFviewer({ pdfURL, windowSize }) {
  return (
    <div>
      <iframe
        src={pdfURL}
        width={windowSize.width}
        height={windowSize.height}
        // frameBorder={0}
        allowFullScreen
      ></iframe>
    </div>
  );
}

export default PDFviewer;
