import axios from "axios";
import React, { ChangeEvent, useState } from "react";
import SmallLoader from "../../../UI/SmallLoader";
import urls from "../../../utils/authURL";
import { ERROR_DATA } from "../../../utils/customTypes";
import { returnToLoginPage } from "../../../utils/generalCommands/ReturnToLoginPage";

interface PERMISSIONS {
  canRename: boolean;
  canDelete: boolean;
  canDownload: boolean;
}
function OwnerSection({ file }) {
  const [editPermissions, setEditPermissions] = useState<PERMISSIONS>({
    canDelete: file?.canDelete || false,
    canDownload: file?.canDownload || false,
    canRename: file?.canRename || false,
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);
  const [error, setError] = useState<ERROR_DATA>({
    isError: false,
    errorMsg: "",
  });

  const inputDate = new Date(file?.createdAt);

  const day = inputDate.getDate().toString().padStart(2, "0");
  const month = (inputDate.getMonth() + 1).toString().padStart(2, "0");
  const year = inputDate.getFullYear();

  const formattedDate = `${day}/${month}/${year}`;

  function editRecipientActions(
    e: ChangeEvent<HTMLInputElement>,
    name: string
  ) {
    setEditPermissions((prevPermissions) => {
      return { ...prevPermissions, [name]: e.target.checked };
    });
  }

  async function editRecipientPermissions() {
    setIsEditing(true);
    const data = {
      ...editPermissions,
      fileID: file?._id,
    };
    try {
      await axios.post(`${urls.sharedFileURL}/file/edit-permissions`, {
        data,
      });
      setIsEditing(false);
      window.location.assign("/share-file/dashboard");
    } catch (error) {
      setIsEditing(false);
      returnToLoginPage(error);

      if (axios.isAxiosError(error)) {
        setError({ isError: true, errorMsg: error.response?.data.message });
      } else {
        setError({ isError: true, errorMsg: "something occured" });
      }
    }
  }

  async function revokeRecipientPermissions() {
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
    <section className="owner-section">
      <div className="file-name">
        <p>File Name:</p>
        <p>{file?.name}</p>
      </div>
      <div className="recipient-email">
        <p>Recipient Email:</p>
        <p>{file.recipientEmail}</p>
      </div>
      <div className="date">
        <p>File shared on:</p>
        <p>{formattedDate}</p>
      </div>
      <div className="permissions-container">
        <h2>What recipient can do with this file</h2>
        <div className="current-permissions">
          {file?.canDownload && <p>Download</p>}
          {file?.canDelete && <p>Delete</p>}
          {file?.canRename && <p>Rename</p>}
        </div>
      </div>
      <div className="edit-permissions-container">
        <h2>Edit what recipient can do</h2>
        <div className="edit-permissions">
          <div className="action">
            <input
              type="checkbox"
              name="canRename"
              checked={editPermissions.canRename}
              onChange={(e) => {
                editRecipientActions(e, "canRename");
              }}
            />
            <p>Rename</p>
          </div>

          <div className="action">
            <input
              type="checkbox"
              name="canDelete"
              checked={editPermissions.canDelete}
              onChange={(e) => {
                editRecipientActions(e, "canDelete");
              }}
            />
            <p>Delete</p>
          </div>

          <div className="action">
            <input
              type="checkbox"
              name="canDownload"
              checked={editPermissions.canDownload}
              onChange={(e) => {
                editRecipientActions(e, "canDownload");
              }}
            />
            <p>Download</p>
          </div>
        </div>
        <div className="buttons">
          <button onClick={editRecipientPermissions}>
            {isEditing ? <SmallLoader /> : "Save changes"}
          </button>
          <small>or</small>
          <button
            onClick={revokeRecipientPermissions}
            className="revoke-button"
          >
            {isRevoking ? <SmallLoader /> : "Revoke access"}
          </button>
        </div>
        {error.isError && <p className="error-msg">{error.errorMsg}</p>}
      </div>
    </section>
  );
}

export default OwnerSection;
