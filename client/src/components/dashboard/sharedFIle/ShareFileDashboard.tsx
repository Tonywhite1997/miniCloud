import axios from "axios";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import FolderIcon from "../../../assets/FolderIcon";
import Loader from "../../../UI/Loader";
import urls from "../../../utils/authURL";
import { returnToLoginPage } from "../../../utils/generalCommands/ReturnToLoginPage";

interface SHARED_FILE {
  recipientEmail: string;
  id: string;
  name: string;
}
interface BORROWED_FILE {
  ownerEmail: string;
  id: string;
  name: string;
}

function ShareFileDashboard() {
  const [filesShared, setFilesShared] = useState([]);
  const [borrowdFiles, setBorrowedFiles] = useState([]);
  const [isTopLoading, setIsTopLoading] = useState<boolean>(false);
  const [isBottomLoading, setIsBottomLoading] = useState<boolean>(false);

  useQuery("SHARED_FILES", {
    queryFn: async () => {
      setIsTopLoading(true);
      try {
        const { data } = await axios.get(`${urls.sharedFileURL}/files`);
        setFilesShared(data.sharedFiles);

        setIsTopLoading(false);
      } catch (error) {
        setIsTopLoading(false);
        returnToLoginPage(error);
      }
    },
    refetchOnWindowFocus: false,
  });

  useQuery("BORROWED_FILES", {
    queryFn: async () => {
      setIsBottomLoading(true);
      try {
        const { data } = await axios.get(
          `${urls.sharedFileURL}/borrowed-files`
        );
        setBorrowedFiles(data.borrowedFiles);
        setIsBottomLoading(false);
      } catch (error) {
        setIsBottomLoading(false);
        returnToLoginPage(error);
      }
    },
    refetchOnWindowFocus: false,
  });

  return (
    <main className="shared-file-dash">
      <section className="your-files">
        <h2>Files you shared with others</h2>
        {isTopLoading && <Loader />}
        {!isTopLoading && (
          <div className="files-container">
            {filesShared.length < 1 && <p>You haven't shared any file.</p>}
            {filesShared &&
              filesShared.map((file: SHARED_FILE) => {
                return (
                  <Link
                    to={`/share-file/dashboard/${file.id}`}
                    key={file.id}
                    className="file"
                  >
                    <p className="file-name">{file.name}</p>
                    <div className="folder-icon-container">
                      <FolderIcon />
                    </div>
                    <p className="email">{file.recipientEmail}</p>
                  </Link>
                );
              })}
          </div>
        )}
      </section>

      <section className="your-borrowed-files">
        <h2>Files you have access to</h2>
        {isBottomLoading && <Loader />}
        {!isBottomLoading && borrowdFiles?.length < 1 && (
          <p>No files were shared with you.</p>
        )}
        <div className="files-container">
          {borrowdFiles?.map((file: BORROWED_FILE) => {
            return (
              <Link
                to={`/share-file/dashboard/${file.id}`}
                className="file"
                key={file.id}
              >
                <p className="file-name">{file.name}</p>
                <div className="folder-icon-container">
                  <FolderIcon />
                </div>
                <p className="email">{file.ownerEmail}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default ShareFileDashboard;
