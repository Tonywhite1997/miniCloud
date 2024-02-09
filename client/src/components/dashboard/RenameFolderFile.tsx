import axios from "axios";
import React, { ChangeEvent, useState } from "react";
import SmallLoader from "../../UI/SmallLoader";
import urls from "../../utils/authURL";
import { returnToLoginPage } from "../../utils/generalCommands/ReturnToLoginPage";

interface RENAME_ERROR {
  isError: boolean;
  errorMsg: string;
}

function RenameFolderFile({ renameFolderFileProps }) {
  const {
    setIsRenamingFolderFile,
    selectedFolderFile,
    setFolderFiles,
    setIsFolderFileOption,
  } = renameFolderFileProps;

  const [renameError, setRenameError] = useState<RENAME_ERROR>({
    isError: false,
    errorMsg: "",
  });

  const [isRenameLoading, setIsRenameLoading] = useState<boolean>(false);

  const currentFileNameArray = selectedFolderFile?.name?.split(".");
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
    ? `${fileName}.${fileExtension}`
    : fileName;

  async function renameFolderFileName() {
    if (!fileName.length) {
      setRenameError({
        isError: true,
        errorMsg: "filename field cannot be empty",
      });
      return;
    }
    setIsRenameLoading(true);
    const fileData = {
      newFileName: formattedNewFileName,
      id: selectedFolderFile.id,
    };

    try {
      const { data } = await axios.post(`${urls.fileURL}/rename-file`, {
        fileData,
      });
      setFolderFiles(data.files);
      setIsRenamingFolderFile(false);
    } catch (error) {
      returnToLoginPage(error);
      setIsRenameLoading(false);
      setRenameError({
        isError: true,
        errorMsg: error?.response?.data.message,
      });
    }
  }

  function handleCancel() {
    setIsRenamingFolderFile(false);
    setIsFolderFileOption(false);
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

          <button onClick={renameFolderFileName}>
            {isRenameLoading ? <SmallLoader /> : "Rename"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RenameFolderFile;
