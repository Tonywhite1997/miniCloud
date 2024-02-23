import axios from "axios";
import React, { ChangeEvent, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import SmallLoader from "../../../UI/SmallLoader";
import urls from "../../../utils/authURL";
import { ERROR_DATA } from "../../../utils/customTypes";
import { returnToLoginPage } from "../../../utils/generalCommands/ReturnToLoginPage";

interface SHAREDFILEDATA {
  fileID: string;
  canRename: boolean;
  canDelete: boolean;
  canDownload: boolean;
}

function ShareFile() {
  const { fileID, filename } = useParams();
  const [recipientEmail, setRecipientEmail] = useState<string>("");
  const [sharedFileData, setSharedFileData] = useState<SHAREDFILEDATA>({
    fileID: fileID || "",
    canRename: false,
    canDelete: false,
    canDownload: false,
  });

  const [error, setError] = useState<ERROR_DATA>({
    isError: false,
    errorMsg: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function selectUserActionsToFile(
    e: ChangeEvent<HTMLInputElement>,
    name: string
  ) {
    setSharedFileData((prevData) => {
      return {
        ...prevData,
        [name]: e.target.checked,
      };
    });
  }

  async function shareFile() {
    setIsLoading(true);
    if (!recipientEmail.trim()) {
      setError({ isError: true, errorMsg: "A valid email is required" });
      return;
    }

    const dataPayload = { ...sharedFileData, filename, recipientEmail };

    try {
      await axios.post(`${urls.sharedFileURL}/share`, {
        dataPayload,
      });
      setIsLoading(false);
      window.location.assign("/share-file/dashboard");
    } catch (error) {
      setIsLoading(false);
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
        {error.isError && <p className="error-msg">{error.errorMsg}</p>}
      </div>
      <label className="action-label">
        Choose what this user can do with this file.
        <br /> Note that once you share a file, the user can always open its
        content:
        <br /> You can't change the "open" default setting.
      </label>
      <div className="accesses">
        <div className="action">
          <input
            type="checkbox"
            name="canRename"
            checked={sharedFileData.canRename}
            onChange={(e) => {
              selectUserActionsToFile(e, "canRename");
            }}
          />
          <p>Rename</p>
        </div>

        <div className="action">
          <input
            type="checkbox"
            name="canDelete"
            checked={sharedFileData.canDelete}
            onChange={(e) => {
              selectUserActionsToFile(e, "canDelete");
            }}
          />
          <p>Delete</p>
        </div>

        <div className="action">
          <input
            type="checkbox"
            name="canDownload"
            checked={sharedFileData.canDownload}
            onChange={(e) => {
              selectUserActionsToFile(e, "canDownload");
            }}
          />
          <p>Download</p>
        </div>
      </div>
      <div className="buttons">
        <Link to="/user/dashboard" className="back">
          cancel
        </Link>
        <button onClick={shareFile}>
          {isLoading ? <SmallLoader /> : "share"}
        </button>
      </div>
    </main>
  );
}

export default ShareFile;
