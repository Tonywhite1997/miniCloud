import React, { useContext, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useMutation } from "react-query";
import CancelIcon from "../../assets/CancelIcon";
import DeleteIcon from "../../assets/DeleteIcon";
import DownloadIcon from "../../assets/DownloadIcon";
import ViewIcon from "../../assets/ViewIcon";
import MoveIcon from "../../assets/MoveIcon";
import RenameIcon from "../../assets/RenameIcon";
import urls from "../../utils/authURL";
import { FILE } from "../../utils/customTypes";
import { userContext } from "../../utils/context";
import { fileContext } from "../../utils/context";
import { downloadFileSetup } from "../../utils/downloadSetup";
import SmallLoader from "../../UI/SmallLoader";
import { returnToLoginPage } from "../../utils/generalCommands/ReturnToLoginPage";
import ShareIcon from "../../assets/ShareIcon";

function FileOptions({ fileOptionsProps }) {
  const {
    closeFileOptions,
    selectedFile,
    setFiles,
    setIsMoveOpen,
    setIsRenamingFile,
    files,
  } = fileOptionsProps;

  const { setUser } = useContext(userContext);

  const { setFileProviderData } = useContext(fileContext);

  const chosenFile = files.find((file: FILE) => {
    return file._id === selectedFile.id;
  });

  const [isDownloadError, setIsDownloadError] = useState<boolean>(false);

  async function deleteFileHandler() {
    const { fileSize, id } = selectedFile;
    const operation: string = "delete";

    try {
      const { data } = await axios.delete(`${urls.fileURL}/${id}`);
      if (data.status === "ok") {
        const { data } = await axios.patch(
          `${urls.userURL}/update-used-space`,
          { fileSize, operation }
        );
        setUser(data.user);
        closeFileOptions();
      }
      setFiles(data.files);
      closeFileOptions();
    } catch (error) {
      setIsDownloadError(true);
      ///if error is due to expired token
      returnToLoginPage(error);
    }
  }

  const { mutate: deleteFile, isLoading } = useMutation(deleteFileHandler);

  const [isDownloadLoading, setIsDownloadLoading] = useState<boolean>(false);

  const url = `${urls.fileURL}/download/${selectedFile?.id}`;

  async function downloadFile() {
    downloadFileSetup(
      url,
      selectedFile,
      closeFileOptions,
      setIsDownloadError,
      setIsDownloadLoading
    );
  }

  function openMoveFileBox() {
    setIsMoveOpen(true);
    closeFileOptions();
  }

  function openFileRenameBox() {
    setIsRenamingFile(true);
    closeFileOptions();
  }

  const mimeType: string = chosenFile.link.split(".").pop();

  return (
    <div className="backdrop">
      <div className="folder-options">
        <div onClick={closeFileOptions}>
          <CancelIcon />
        </div>
        <div className="selected-folder-container">
          <div className="file-extension">
            <p>
              {mimeType.length > 4
                ? selectedFile.name.split(".").slice(-1)
                : mimeType}
            </p>
          </div>
          <p className="selected-folder">{selectedFile?.name?.split(".")[0]}</p>
        </div>

        <Link
          to={`/files/${chosenFile._id}/display`}
          className="file-options-view"
          onClick={() => setFileProviderData(chosenFile)}
        >
          <ViewIcon />
          <p>Open</p>
        </Link>

        <div
          className="folder-options-remove"
          onClick={() => {
            deleteFile();
          }}
        >
          <DeleteIcon />
          <p>Remove</p>
          {isLoading && <SmallLoader />}
        </div>

        <div className="folder-options-rename" onClick={openFileRenameBox}>
          <RenameIcon />
          <p>Rename</p>
        </div>

        <Link
          to={`/file/share-file/${selectedFile.id}/${selectedFile.name}`}
          className="folder-options-share"
        >
          <ShareIcon />
          <p>Share</p>
        </Link>

        <div className="folder-options-move" onClick={openMoveFileBox}>
          <MoveIcon />
          <p>Move</p>
        </div>

        <div className="file-options-download">
          <DownloadIcon />
          <p onClick={downloadFile}>Download</p>
          {isDownloadLoading && <SmallLoader />}
        </div>

        {isDownloadError && (
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

export default FileOptions;
