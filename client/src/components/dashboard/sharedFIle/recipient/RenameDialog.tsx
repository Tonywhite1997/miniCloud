import axios from "axios";
import React, { useState } from "react";
import SmallLoader from "../../../../UI/SmallLoader";
import urls from "../../../../utils/authURL";
import { ERROR_DATA } from "../../../../utils/customTypes";
import { returnToLoginPage } from "../../../../utils/generalCommands/ReturnToLoginPage";

function RenameDialog({ setOpenSharedFileRename, file }) {
  const currentFileNameArray = file?.name?.split(".");
  const currentName =
    currentFileNameArray.length > 1
      ? currentFileNameArray.slice(0, -1).join(".")
      : currentFileNameArray.join("");

  const fileExtension = currentFileNameArray && currentFileNameArray.pop();

  const [newFilename, setNewFilename] = useState<string>(currentName);

  const [isRenameLoading, setIsRenameLoading] = useState<boolean>(false);

  const [error, setError] = useState<ERROR_DATA>({
    isError: false,
    errorMsg: "",
  });

  function getNewFileName(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    setNewFilename(value);
  }

  const formattedNewFilename = fileExtension
    ? `${newFilename.trim()}.${fileExtension}`
    : newFilename;

  async function recipientRenameFile() {
    setIsRenameLoading(true);
    try {
      await axios.post(`${urls.sharedFileURL}/file/rename`, {
        newFilename: formattedNewFilename,
        fileID: file?._id,
      });
      setIsRenameLoading(false);
      window.location.reload();
    } catch (error) {
      setIsRenameLoading(false);
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
    <div className="background-overlay">
      <div className="form">
        <div className="input-field-container">
          <label>Rename File</label>
          <input
            placeholder="new file name"
            value={newFilename}
            onChange={getNewFileName}
          />
          {error.isError && <p className="error-msg">{error.errorMsg}</p>}
        </div>
        <div className="buttons">
          <button
            onClick={() => {
              setOpenSharedFileRename(false);
            }}
          >
            Cancel
          </button>
          <button onClick={recipientRenameFile}>
            {isRenameLoading ? <SmallLoader /> : "Rename"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RenameDialog;
