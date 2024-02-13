import React from "react";
import FolderIcon from "../../../../assets/FolderIcon";
import { FOLDER } from "../../../../utils/customTypes";

function FolderTSX({ folderStructureProps }) {
  const { folders, setFolderToLoad, multipleFilesSelected, openFolderOptions } =
    folderStructureProps;
  return (
    <>
      {folders.map((folder: FOLDER) => {
        return (
          <div className="folder-container" key={folder._id}>
            <div
              className="folder"
              onClick={() => {
                setFolderToLoad(folder);
              }}
            >
              <div className="folder-icon-container">
                <FolderIcon />
              </div>
              <p className="folder-name">{folder.name}</p>
            </div>
            {!multipleFilesSelected.length && (
              <span
                className="folder-options-button"
                onClick={() => openFolderOptions(folder)}
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

export default FolderTSX;
