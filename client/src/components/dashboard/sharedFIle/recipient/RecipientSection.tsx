import axios from "axios";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import SmallLoader from "../../../../UI/SmallLoader";
import urls from "../../../../utils/authURL";
import { ERROR_DATA } from "../../../../utils/customTypes";
import { returnToLoginPage } from "../../../../utils/generalCommands/ReturnToLoginPage";

function RecipientSection({ file, setIsRenaming }) {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<ERROR_DATA>({
    isError: false,
    errorMsg: "",
  });
  const [errorBelow, setErrorBelow] = useState<ERROR_DATA>({
    isError: false,
    errorMsg: "",
  });

  const [isRevoking, setIsRevoking] = useState(false);

  const date = new Date(file?.createdAt);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  const formattedDate = `${day}/${month}/${year}`;

  async function deleteSharedFile() {
    setIsDeleting(true);
    try {
      await axios.delete(`${urls.sharedFileURL}/file/delete-file`, {
        data: {
          fileID: file?._id,
        },
      });
      setIsDeleting(false);
      window.location.assign("/share-file/dashboard");
    } catch (error) {
      setIsDeleting(false);
      returnToLoginPage(error);

      if (axios.isAxiosError(error)) {
        setError({
          isError: true,
          errorMsg: error?.response?.data.message,
        });
      } else {
        setError({ isError: true, errorMsg: "something occured" });
      }
    }
  }

  async function withdrawMyAccess() {
    setIsRevoking(true);

    try {
      await axios.post(`${urls.sharedFileURL}/file/revoke-permissions`, {
        fileID: file?._id,
      });
      setIsRevoking(false);
      window.location.assign("/share-file/dashboard");
    } catch (error) {
      setIsRevoking(false);
      returnToLoginPage(error);

      if (axios.isAxiosError(error)) {
        setErrorBelow({
          isError: true,
          errorMsg: error?.response?.data.message,
        });
      } else {
        setErrorBelow({ isError: true, errorMsg: "something occured" });
      }
    }
  }

  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  async function downloadSharedFile() {
    setIsDownloading(true);
    try {
      const response = await axios.get(
        `${urls.sharedFileURL}/file/download/${file?._id}`
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = file?.name;
      document.body.appendChild(a);

      a.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );

      document.body.removeChild(a);
      setIsDownloading(false);
    } catch (error) {
      returnToLoginPage(error);
      setIsDownloading(false);

      if (axios.isAxiosError(error)) {
        setError({
          isError: true,
          errorMsg: error?.response?.data.message,
        });
      } else {
        setError({ isError: true, errorMsg: "something occured" });
      }
    }
  }

  return (
    <section className="recipient-section">
      <div className="file-name">
        <p>File Name:</p>
        <p>{file?.name}</p>
      </div>
      <div className="recipient-email">
        <p>Owner's Email:</p>
        <p>{file?.ownerEmail}</p>
      </div>
      <div className="date">
        <p>File shared on:</p>
        <p>{formattedDate}</p>
      </div>
      <div className="permissions-container">
        <h2>What you can do with this file</h2>
        <div className="action-buttons">
          <button>
            <Link to={`/share-files/${file._id}/display`} className="link">
              Open
            </Link>
          </button>
          {file?.canDownload && (
            <button onClick={downloadSharedFile}>
              {isDownloading ? <SmallLoader /> : "Download"}
            </button>
          )}
          {file?.canDelete && (
            <button onClick={deleteSharedFile} className="delete">
              {isDeleting ? <SmallLoader /> : "Delete"}
            </button>
          )}
          {file?.canRename && (
            <button
              onClick={() => {
                setIsRenaming(true);
              }}
            >
              Rename
            </button>
          )}
        </div>
      </div>
      {error.isError && <p className="error-msg">{error.errorMsg}</p>}
      <div className="withdraw-access">
        <h2>Withdraw your access to this file </h2>
        <button onClick={withdrawMyAccess}>
          {isRevoking ? <SmallLoader /> : "Withdraw Access"}
        </button>
        {errorBelow.isError && (
          <p className="error-msg">{errorBelow.errorMsg}</p>
        )}
      </div>
    </section>
  );
}

export default RecipientSection;
