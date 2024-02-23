import axios from "axios";
import React, { useState } from "react";
import { useMutation } from "react-query";
import SmallLoader from "../../../UI/SmallLoader";
import urls from "../../../utils/authURL";
import { ERROR_DATA } from "../../../utils/customTypes";
import { returnToLoginPage } from "../../../utils/generalCommands/ReturnToLoginPage";

interface FOLDER {
  name: string;
  _id: string;
}

function MoveFile({ moveFileProps }) {
  const {
    folders: data,
    setIsMoveOpen,
    selectedFile,
    setFiles,
    currentFolderDetails,
    selectedFolderFile,
    setFolderFiles,
    setSelectedFolderFile,
    setSelectedFile,
    multipleFilesSelected,
    setMultipleFilesSelected,
  } = moveFileProps;

  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [error, setError] = useState<ERROR_DATA>({
    errorMsg: "",
    isError: false,
  });

  function changeSelectedFolder(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedFolder(e.target.value);
  }

  function removeMoveFilePopupAndResetFile() {
    setIsMoveOpen(false);
    setSelectedFile({});
    setSelectedFolderFile({});
    setMultipleFilesSelected([]);
  }

  interface MOVE_FILE {
    fileID: string;
    fileName: string;
  }

  async function moveMultipleFiles(): Promise<void> {
    const targetFolderID = (
      data.find((folder: FOLDER) => selectedFolder === folder.name) || {}
    )._id;

    let patchUrl: string = "";

    if (targetFolderID && currentFolderDetails.id) {
      patchUrl = `${urls.fileURL}/move-files?targetFolderID=${targetFolderID}&currentFolderID=${currentFolderDetails.id}`;
    } else if (targetFolderID && !currentFolderDetails.id) {
      patchUrl = `${urls.fileURL}/move-files?targetFolderID=${targetFolderID}`;
    } else if (currentFolderDetails.id && !targetFolderID) {
      patchUrl = `${urls.fileURL}/move-files?currentFolderID=${currentFolderDetails.id}`;
    }

    if (!currentFolderDetails.id && !targetFolderID) {
      setError({ errorMsg: "select a folder", isError: true });
      return;
    }

    try {
      const fileIDs = multipleFilesSelected.map((fileData: MOVE_FILE) => {
        return fileData.fileID;
      });
      const { data } = await axios.patch(patchUrl, { fileIDs });

      if (currentFolderDetails.id) {
        setFolderFiles(data.files);
      } else {
        setFiles(data.files);
      }
      setMultipleFilesSelected([]);
      removeMoveFilePopupAndResetFile();
    } catch (error) {
      returnToLoginPage(error);

      if (axios.isAxiosError(error)) {
        setError({
          errorMsg: error?.response?.data?.message,
          isError: true,
        });
      } else {
        setError({ errorMsg: "something happened", isError: true });
      }
    }
  }
  async function moveFileToNewFolder() {
    if (multipleFilesSelected.length > 0) {
      return moveMultipleFiles();
    }

    const targetFolder = data.find((folder: FOLDER) => {
      if (folder.name === selectedFolder) {
        return folder;
      }
    });

    const fileId = selectedFolderFile.id
      ? selectedFolderFile.id
      : selectedFile.id;

    let patchUrl: string = "";

    if (targetFolder?._id && currentFolderDetails.id) {
      patchUrl = `${urls.fileURL}/move-file/${fileId}?targetFolderID=${targetFolder?._id}&currentFolderID=${currentFolderDetails.id}`;
    } else if (targetFolder?._id && !currentFolderDetails.id) {
      patchUrl = `${urls.fileURL}/move-file/${fileId}?targetFolderID=${targetFolder?._id}`;
    } else if (currentFolderDetails.id && !targetFolder?._id) {
      patchUrl = `${urls.fileURL}/move-file/${fileId}?currentFolderID=${currentFolderDetails.id}`;
    }

    if (!currentFolderDetails.id && !targetFolder?._id) {
      setError({ errorMsg: "select a folder", isError: true });
      return;
    }

    try {
      const { data: fileData } = await axios.patch(patchUrl);

      if (currentFolderDetails.id) {
        setFolderFiles(fileData.files);
      } else {
        setFiles(fileData.files);
      }
      removeMoveFilePopupAndResetFile();
    } catch (error) {
      returnToLoginPage(error);
      if (axios.isAxiosError(error)) {
        setError({
          errorMsg: error?.response?.data?.message,
          isError: true,
        });
      } else {
        setError({ errorMsg: "something happened", isError: true });
      }
    }
  }

  const { mutate: movehandler, isLoading } = useMutation(moveFileToNewFolder);

  return (
    <div className="folder-backdrop">
      <div className="new-folder">
        <div className="folder-name-container">
          <h3>Select a Folder</h3>
          {!multipleFilesSelected.length && (
            <p
              style={{
                marginTop: "-1em",
                color: "grey",
                fontSize: ".8rem",
                width: "100%",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              className="file-name"
            >
              {selectedFile.name
                ? `${selectedFile.name}`
                : `${selectedFolderFile.name}`}
            </p>
          )}
          {multipleFilesSelected.length > 0 && (
            <p style={{ marginTop: "-1em", color: "grey", fontSize: ".8rem" }}>
              moving multiple files
            </p>
          )}
          <select onChange={(e) => changeSelectedFolder(e)}>
            <option>root folder</option>
            {data.map((folder: FOLDER) => {
              if (folder.name !== currentFolderDetails.name) {
                return <option key={folder._id}>{folder.name}</option>;
              }
            })}
          </select>
          {error.isError && <p className="error-text">{error.errorMsg}</p>}
          <div className="move-buttons">
            <button onClick={removeMoveFilePopupAndResetFile}>Cancel</button>
            <button
              onClick={() => {
                movehandler();
              }}
            >
              {isLoading ? <SmallLoader /> : "Move"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoveFile;
