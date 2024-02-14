import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

interface SHAREDFILEDATA {
  fileID: string;
  rename: boolean;
  delete: boolean;
  download: boolean;
}

function ShareFile() {
  const { fileID, filename } = useParams();
  const [recipientEmail, setRecipientEmail] = useState<string>("");
  const [sharedFileData, setSharedFileData] = useState<SHAREDFILEDATA>({
    fileID: fileID || "",
    rename: false,
    delete: false,
    download: false,
  });

  const [error, setError] = useState({
    isError: false,
    errorMsg: "",
  });

  function selectUserActionsToFile(e, name: string) {
    setSharedFileData((prevData) => {
      return {
        ...prevData,
        [name]: e.target.checked,
      };
    });
  }

  function shareFile() {
    if (!recipientEmail.trim()) {
      setError({ isError: true, errorMsg: "A valid email is required" });
      return;
    }
  }

  return (
    <main className="share-file">
      <h3>
        Sharing <span className="filename">{filename} </span>
        with another validated user
      </h3>
      <div className="recipient">
        <label htmlFor="recipient">Enter the recepient email</label>
        <input
          type="email"
          id="recipient"
          placeholder="recipient email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
        />
        <p>{error.errorMsg}</p>
      </div>
      <label className="action-label">
        Choose what this user can do with this file
      </label>
      <div className="accesses">
        <div className="action">
          <input
            type="checkbox"
            name="rename"
            checked={sharedFileData.rename}
            onChange={(e) => {
              selectUserActionsToFile(e, "rename");
            }}
          />
          <p>Rename</p>
        </div>

        <div className="action">
          <input
            type="checkbox"
            name="delete"
            checked={sharedFileData.delete}
            onChange={(e) => {
              selectUserActionsToFile(e, "delete");
            }}
          />
          <p>Delete</p>
        </div>

        <div className="action">
          <input
            type="checkbox"
            name="download"
            checked={sharedFileData.download}
            onChange={(e) => {
              selectUserActionsToFile(e, "download");
            }}
          />
          <p>Download</p>
        </div>
      </div>
      <div className="buttons">
        <Link to="/user/dashboard" className="back">
          cancel
        </Link>
        <button>share</button>
      </div>
    </main>
  );
}

export default ShareFile;
