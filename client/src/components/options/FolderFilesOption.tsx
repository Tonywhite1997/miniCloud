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

function FileOptions({ folderFileOptionsProps }) {
  const {
    selectedFolderFile,
    closeFolderFileOptions,
    setFolderFiles,
    currentFolderDetails,
    setIsMoveOpen,
    folderFiles,
    setIsRenamingFolderFile,
  } = folderFileOptionsProps;

  const { setUser } = useContext(userContext);

  const chosenFile = folderFiles.find((file: FILE) => {
    return file._id === selectedFolderFile.id;
  });

  const { setFileProviderData } = useContext(fileContext);

  const [isDownloadError, setIsDownloadError] = useState<boolean>(false);

  async function deleteFolderFileHandler() {
    const { fileSize, id } = selectedFolderFile;
    const operation: string = "delete";

    try {
      const { data } = await axios.delete(`${urls.fileURL}/${id}`, {
        data: { folderID: currentFolderDetails.id },
      });
      if (data.status === "ok") {
        const { data } = await axios.patch(
          `${urls.userURL}/update-used-space`,
          { fileSize, operation }
        );
        setUser(data.user);
      }
      closeFolderFileOptions();
      setFolderFiles(data.files);
    } catch (error) {
      returnToLoginPage(error);
      setIsDownloadError(true);
    }
  }

  const { mutate: deleteFolderFile, isLoading } = useMutation(
    deleteFolderFileHandler
  );

  function openMoveFolderFileBox() {
    setIsMoveOpen(true);
    closeFolderFileOptions();
  }

  const [isDownloadLoading, setIsDownloadLoading] = useState<boolean>(false);

  const url = `${urls.fileURL}/download/${selectedFolderFile?.id}`;

  function downloadFile() {
    downloadFileSetup(
      url,
      selectedFolderFile,
      closeFolderFileOptions,
      setIsDownloadError,
      setIsDownloadLoading
    );
  }

  const mimeType: string = chosenFile.link.split(".").pop();

  return (
    <div className="backdrop">
      <div className="folder-options">
        <div onClick={closeFolderFileOptions}>
          <CancelIcon />
        </div>
        <div className="selected-folder-container">
          <div className="file-extension">
            <p>
              {mimeType.length > 4
                ? selectedFolderFile.name.split(".").slice(-1)
                : mimeType}
            </p>
          </div>
          <p className="selected-folder">
            {`${selectedFolderFile.name}`.split(".")[0]}
          </p>
        </div>

        <Link
          // to="/user/dashboard/file"
          to={`/files/${chosenFile._id}/display`}
          className="folder-options-view"
          onClick={() => setFileProviderData(chosenFile)}
        >
          <ViewIcon />
          <p>Open</p>
        </Link>

        <div
          className="folder-options-remove"
          onClick={() => {
            deleteFolderFile();
          }}
        >
          <DeleteIcon />
          <p>Remove</p>
          {isLoading && <SmallLoader />}
        </div>

        <div
          className="folder-options-rename"
          onClick={() => {
            setIsRenamingFolderFile(true);
            closeFolderFileOptions(true);
          }}
        >
          <RenameIcon />
          <p>Rename</p>
        </div>

        <Link
          to={`/file/share-file/${selectedFolderFile.id}/${selectedFolderFile.name}`}
          className="folder-options-share"
        >
          <ShareIcon />
          <p>Share</p>
        </Link>

        <div className="folder-options-move" onClick={openMoveFolderFileBox}>
          <MoveIcon />
          <p>Move</p>
        </div>

        <div className="file-options-download" onClick={downloadFile}>
          <DownloadIcon />
          <p>Download</p>
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
