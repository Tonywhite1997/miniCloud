import React, { ChangeEvent, useState } from "react";
import axios from "axios";
import { useMutation } from "react-query";
import urls from "../../utils/authURL";
import SmallLoader from "../../UI/SmallLoader";
import { returnToLoginPage } from "../../utils/generalCommands/ReturnToLoginPage";

function NewFolder({ newFolderProps }) {
  const [folderErrorMessage, setFolderErrorMessage] = useState<string>("");

  const {
    cancelNewFolder: handleCancel,
    setFolders,
    isRenaming,
    selectedFolderId: folderId,
    selectedFolder: selectedFolderName,
    setSelectedFolder,
  } = newFolderProps;

  const [folderName, setFolderName] = useState<string>("");
  function getNewFolderName(event: ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    setFolderErrorMessage("");
    setFolderName(event.target.value);
    setSelectedFolder(event.target.value);
  }

  async function createFolder() {
    const formattedFolderName = `${folderName
      .slice(0, 1)
      .toUpperCase()}${folderName.slice(1)}`;
    try {
      const { data } = await axios.post(
        `${urls.folderURL}/create-folder`,
        {
          name: formattedFolderName,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setFolders(data?.folders);
      handleCancel();
    } catch (error) {
      returnToLoginPage(error);

      if (axios.isAxiosError(error)) {
        setFolderErrorMessage(error.response?.data.message);
      } else {
        setFolderErrorMessage("something occured");
      }
    }
  }

  const { mutate: createFolderRefetch, isLoading: createIsLoading } =
    useMutation(createFolder);

  async function renameFolder() {
    if (isRenaming) {
      const formattedSelectedFolderName = `${selectedFolderName
        .slice(0, 1)
        .toUpperCase()}${selectedFolderName.slice(1)}`;
      try {
        const { data } = await axios.patch(
          `${urls.folderURL}/my-folders/${folderId}`,
          {
            name: formattedSelectedFolderName,
          }
        );
        setFolders(data?.folders);
        handleCancel();
      } catch (error) {
        returnToLoginPage(error);

        if (axios.isAxiosError(error)) {
          setFolderErrorMessage(error.response?.data.message);
        } else {
          setFolderErrorMessage("something occured");
        }
      }
    }
  }

  const { mutate: renameFolderRefetch, isLoading: renameIsLoading } =
    useMutation(renameFolder);

  return (
    <div className="folder-backdrop">
      <div className="new-folder">
        <div className="folder-name-container">
          <label htmlFor="folder-name">
            {isRenaming ? "Rename Folder" : "Create Folder"}
          </label>
          <input
            type="text"
            placeholder="folder name"
            id="folder-name"
            value={isRenaming ? selectedFolderName : folderName}
            onChange={getNewFolderName}
          />
        </div>
        {folderErrorMessage && (
          <p className="folder-error">{folderErrorMessage}</p>
        )}
        <div className="button">
          <button className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>

          {!isRenaming && (
            <button
              onClick={() => {
                createFolderRefetch();
              }}
            >
              {createIsLoading ? <SmallLoader /> : "Create"}
            </button>
          )}

          {isRenaming && (
            <button
              onClick={() => {
                renameFolderRefetch();
              }}
            >
              {renameIsLoading ? <SmallLoader /> : "Rename"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewFolder;
