import axios from "axios";
import React, { ChangeEvent, useState } from "react";
import SmallLoader from "../../UI/SmallLoader";
import urls from "../../utils/authURL";
import { ERROR_DATA } from "../../utils/customTypes";
import { returnToLoginPage } from "../../utils/generalCommands/ReturnToLoginPage";

function RenameFile({ renameFileProps }) {
  const { setIsRenamingFile, selectedFile, setFiles, setIsFileOption } =
    renameFileProps;

  const [renameError, setRenameError] = useState<ERROR_DATA>({
    isError: false,
    errorMsg: "",
  });

  const [isRenameLoading, setIsRenameLoading] = useState<boolean>(false);

  const currentFileNameArray = selectedFile?.name?.split(".");
  const currentName =
    currentFileNameArray.length > 1
      ? currentFileNameArray.slice(0, -1).join(".")
      : currentFileNameArray.join("");

  const fileExtension = currentFileNameArray && currentFileNameArray.pop();

  const [fileName, setFileName] = useState<string>(currentName);

  function getNewFileName(e: ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    setFileName(value);
  }

  const formattedNewFileName = fileExtension
    ? `${fileName.trim()}.${fileExtension}`
    : fileName;

  async function renameFileName() {
    if (!fileName.trim().length) {
      setRenameError({
        isError: true,
        errorMsg: "filename field cannot be empty",
      });
      return;
    }
    setIsRenameLoading(true);
    const fileData = { newFileName: formattedNewFileName, id: selectedFile.id };

    try {
      const { data } = await axios.post(`${urls.fileURL}/rename-file`, {
        fileData,
      });
      setFiles(data.files);
      setIsRenamingFile(false);
    } catch (error) {
      returnToLoginPage(error);
      setIsRenameLoading(false);

      if (axios.isAxiosError(error)) {
        setRenameError({
          isError: true,
          errorMsg: error?.response?.data.message,
        });
      } else {
        setRenameError({ isError: true, errorMsg: "something occured" });
      }
    }
  }

  function handleCancel() {
    setIsRenamingFile(false);
    setIsFileOption(false);
  }

  return (
    <div className="folder-backdrop">
      <div className="new-folder">
        <div className="folder-name-container">
          <label htmlFor="folder-name">Rename File</label>
          <input
            type="text"
            placeholder="folder name"
            id="folder-name"
            value={fileName}
            onChange={(e) => {
              getNewFileName(e);
            }}
          />
        </div>
        {renameError.isError && (
          <p className="folder-error">{renameError.errorMsg}</p>
        )}
        <div className="button">
          <button className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>

          <button onClick={renameFileName}>
            {isRenameLoading ? <SmallLoader /> : "Rename"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RenameFile;
