import React, { useEffect, useState } from "react";
import axios from "axios";
import { useMutation } from "react-query";
import DeleteIcon from "../../assets/DeleteIcon";
import RenameIcon from "../../assets/RenameIcon";
import CancelIcon from "../../assets/CancelIcon";
import FolderIcon from "../../assets/FolderIcon";
import urls from "../../utils/authURL";
import { FILE } from "../../utils/customTypes";
import SmallLoader from "../../UI/SmallLoader";
import { returnToLoginPage } from "../../utils/generalCommands/ReturnToLoginPage";

function FolderOptions({ folderOptionsProps }) {
  const {
    closeFolder,
    selectedFolder: folderName,
    selectedFolderId: folderId,
    setFolders: updateFolders,
    setIsRenaming,
    setIsNewFolder,
    setIsFolderOption,
    files,
  } = folderOptionsProps;

  const [isFolderDeletable, setIsFolderDeletable] = useState(false);

  useEffect(() => {
    const currentFiles = files.filter((file: FILE) => {
      return file.folder === folderId;
    });
    if (currentFiles.length === 0) {
      setIsFolderDeletable(true);
    } else {
      setIsFolderDeletable(false);
    }
  }, [files, folderId]);

  const [isError, setIsError] = useState<boolean>(false);

  async function deleteFolderHandler() {
    if (!folderId) return console.error("folder id is needed");
    try {
      const { data } = await axios.delete(
        `${urls.folderURL}/my-folders/${folderId}`
      );
      updateFolders(data?.folders);
      closeFolder();
    } catch (error) {
      returnToLoginPage(error);
      setIsError(true);
    }
  }

  const { mutate: deleteFolder, isLoading } = useMutation(deleteFolderHandler);

  function activateRenameMode() {
    setIsRenaming(true);
    setIsNewFolder(true);
    setIsFolderOption(false);
  }

  return (
    <div className="folder-option-container backdrop">
      <div className="folder-options">
        <div className="cancel-icon" onClick={closeFolder}>
          <CancelIcon />
        </div>
        <div className="selected-folder-container">
          <FolderIcon />
          <p className="selected-folder">{folderName}</p>
        </div>
        <div className="folder-options-rename" onClick={activateRenameMode}>
          <RenameIcon />
          <p>Rename</p>
        </div>
        {isFolderDeletable && (
          <div
            className="folder-options-remove"
            onClick={() => {
              deleteFolder();
            }}
          >
            <DeleteIcon />
            <p>Remove</p>
            {isLoading && <SmallLoader />}
          </div>
        )}
        {!folderId && (
          <div>
            <p>Download</p>
          </div>
        )}
        {isError && (
          <p
            style={{
              textAlign: "center",
              fontWeight: "400",
              color: "rgb(232, 50, 50)",
            }}
          >
            Error occured. Please try again later
          </p>
        )}
      </div>
    </div>
  );
}

export default FolderOptions;
