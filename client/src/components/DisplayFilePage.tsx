import React, { useContext, useState, useEffect } from "react";
import { fileContext } from "../utils/context";
import ImageViewer from "./fileViewersAndPlayers/ImageViewer";
import AudioPlayer from "./fileViewersAndPlayers/AudioPlayer";
import PDFviewer from "./fileViewersAndPlayers/PDFviewer";
import VideoPlayer from "./fileViewersAndPlayers/VideoPlayer";
import { Link, useParams } from "react-router-dom";

interface WINDOW {
  height: number;
  width: number;
}

function DisplayFilePage() {
  const [windowSize, setWindowSize] = useState<WINDOW>({
    height: window.innerHeight - 100,
    width: window.innerWidth - 64,
  });

  useEffect(() => {
    window.addEventListener("resize", () => {
      setWindowSize({
        height: window.innerHeight - 100,
        width: window.innerWidth - 64,
      });
    });
    return () => {
      window.removeEventListener("resize", () => {
        setWindowSize({
          height: window.innerHeight - 100,
          width: window.innerWidth - 64,
        });
      });
    };
  });

  const { fileID, mimeType } = useParams<{
    fileID: string;
    mimeType: string;
  }>();

  const { fileProviderData } = useContext(fileContext);

  const imageTypes = ["png", "jpg", "jpeg", "webp", "tiff", "svg", "gif"];
  const videoTypes = ["mp4", "ogg", "webm", "ogv"];
  const audioTypes = ["mpeg", "wav", "ogg", "aac", "mp4", "m4a"];
  const bookTypes = ["pdf"];
  const acceptedTypes = [
    "png",
    "jpg",
    "jpeg",
    "webp",
    "tiff",
    "svg",
    "gif",
    "mp4",
    "ogg",
    "webm",
    "ogv",
    "mpeg",
    "wav",
    "ogg",
    "aac",
    "mp4",
    "m4a",
    "pdf",
  ];

  const fileURL: string = `https://minicloud-s3.s3.amazonaws.com/upload/${fileID}.${mimeType}`;

  const alternateMimeType =
    fileProviderData.mimetype && fileProviderData.mimetype.split("/")[1];
  const usefulMimeType = mimeType || alternateMimeType;

  return (
    <div className="display-file-page">
      {!acceptedTypes.includes(usefulMimeType) && (
        <div>
          <h2>File type not supported</h2>
          <Link to="/user/dashboard">back</Link>
        </div>
      )}

      {/* for images files*/}
      {fileProviderData && imageTypes.includes(usefulMimeType) && (
        <ImageViewer imageURL={fileURL} />
      )}

      {/* for WINDOWs files */}
      {fileProviderData && videoTypes.includes(usefulMimeType) && (
        <VideoPlayer videoURL={fileURL} windowSize={windowSize} />
      )}

      {/* for audio files */}
      {fileProviderData && audioTypes.includes(usefulMimeType) && (
        <AudioPlayer audioURL={fileURL} />
      )}

      {/* for pdf files */}
      {fileProviderData && bookTypes.includes(usefulMimeType) && (
        <PDFviewer pdfURL={fileURL} windowSize={windowSize} />
      )}
    </div>
  );
}

export default DisplayFilePage;
