import React from "react";

interface PDF_Type {
  pdfURL: string;
  windowSize: {
    height: number;
    width: number;
  };
}

function PDFviewer({ pdfURL, windowSize }: PDF_Type) {
  return (
    <div>
      <iframe
        src={pdfURL}
        width={windowSize.width}
        height={windowSize.height}
        allowFullScreen
      ></iframe>
    </div>
  );
}

export default PDFviewer;
