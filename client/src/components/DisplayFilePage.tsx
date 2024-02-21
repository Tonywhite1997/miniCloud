import React, { useContext, useState, useEffect } from "react";
import { useQuery } from "react-query";
import ImageViewer from "./fileViewersAndPlayers/ImageViewer";
import AudioPlayer from "./fileViewersAndPlayers/AudioPlayer";
import PDFviewer from "./fileViewersAndPlayers/PDFviewer";
import VideoPlayer from "./fileViewersAndPlayers/VideoPlayer";
import { useParams } from "react-router-dom";
import { ERROR_DATA, FILE } from "../utils/customTypes";
import axios from "axios";
import urls from "../utils/authURL";
import { returnToLoginPage } from "../utils/generalCommands/ReturnToLoginPage";
import Loader from "../UI/Loader";

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

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ERROR_DATA>({
    isError: false,
    errorMsg: "",
  });
  const [file, setFile] = useState<FILE>({});

  const { fileID } = useParams<{ fileID: string }>();

  useQuery("FILE", {
    queryFn: async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(
          `${urls.fileURL}/display/files/${fileID}`
        );
        setFile(data.file);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        setError({ isError: true, errorMsg: error.response.data.message });
        returnToLoginPage(error);
      }
    },
    refetchOnWindowFocus: false,
  });

  const types = ["audio", "video", "image", "application/pdf"];

  return (
    <div className="display-file-page">
      {isLoading && <Loader />}

      {file._id && !types.some((type) => file.mimetype.includes(type)) && (
        <p>File not supported</p>
      )}

      {error.isError && <p className="error-msg">{error.errorMsg}</p>}

      {/* for images files*/}
      {file._id && file.mimetype.includes("image") && (
        <ImageViewer imageURL={file.link} />
      )}

      {/* for video files */}
      {file._id && file.mimetype.includes("video") && (
        <VideoPlayer
          videoURL={file.link}
          windowSize={windowSize}
          type={file.mimetype}
        />
      )}

      {/* for audio files */}
      {file._id && file.mimetype.includes("audio") && (
        <AudioPlayer audioURL={file.link} type={file.mimetype} />
      )}

      {/* for pdf files */}
      {file._id && file.mimetype.includes("application/pdf") && (
        <PDFviewer pdfURL={file.link} windowSize={windowSize} />
      )}
    </div>
  );
}

export default DisplayFilePage;
