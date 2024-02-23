import React from "react";
import prettyBytes from "pretty-bytes";
import { FILE, FileDataType } from "../../../../utils/customTypes";

function FolderFileJSX({ folderFileStructureProps }) {
  const {
    folderFiles,
    selectingMultipleFilesToDelete,
    openFolderFileOptions,
    multipleFilesSelected,
  } = folderFileStructureProps;

  return (
    <>
      {folderFiles.map((file: FILE) => {
        return (
          <div className="file-container" key={file._id}>
            <div
              className="file"
              style={{
                backgroundColor: multipleFilesSelected.some(
                  (fileData: FileDataType) => fileData.fileID === file._id
                )
                  ? "rgb(69, 68, 68)"
                  : "initial",

                color: multipleFilesSelected.some(
                  (fileData: FileDataType) => fileData.fileID === file._id
                )
                  ? "white"
                  : "initial",
              }}
              onClick={() => {
                selectingMultipleFilesToDelete(file);
              }}
            >
              <div className="file-type">
                <p>
                  {file.mimetype.split("/")[1].length > 4
                    ? file.fileName.split(".").slice(-1)
                    : file.mimetype.split("/")[1]}
                </p>
              </div>
              <div className="file-details">
                <p className="file-name">{file.fileName}</p>
                <p>
                  {prettyBytes(file.size, {
                    space: false,
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
            </div>
            {!multipleFilesSelected.length && (
              <span
                className="file-options-button"
                onClick={() => openFolderFileOptions(file)}
              >
                &#8942;
              </span>
            )}
          </div>
        );
      })}
    </>
  );
}

export default FolderFileJSX;
