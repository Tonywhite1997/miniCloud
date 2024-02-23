import React, { useEffect, useState, useContext, ChangeEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios, { AxiosRequestConfig } from "axios";
import CreateFolderIcon from "../../../assets/CreateFolderIcon";
import UploadIcon from "../../../assets/UploadIcon";
import NewFolder from "../NewFolder";
import MoveFile from "../moveFiles/MoveFile";
import urls from "../../../utils/authURL";
import { ERROR_DATA, FILE, FOLDER } from "../../../utils/customTypes";
import FolderOptions from "../../options/FolderOptions";
import { userContext } from "../../../utils/context";
import FileOptions from "../../options/FileOptions";
import FolderFileOptions from "../../options/FolderFilesOption";
import Loader from "../../../UI/Loader";
import { returnToLoginPage } from "../../../utils/generalCommands/ReturnToLoginPage";
import SmallLoader from "../../../UI/SmallLoader";
import RenameFile from "../RenameFile";
import RenameFolderFile from "../RenameFolderFile";
import FileTSX from "./components/FileTSX";
import FolderFileJSX from "./components/FolderFileTSX";
import FolderTSX from "./components/FolderTSX";

function FileSection() {
  const [isNewFolder, setIsNewFolder] = useState(false);
  const [isRenamingFile, setIsRenamingFile] = useState(false);
  const [isRenamingFolderFile, setIsRenamingFolderFile] = useState(false);

  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [isFolderOption, setIsFolderOption] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [currentFolderDetails, setCurrentFolderDetails] = useState({
    id: "",
    name: "",
  });

  const [folderFiles, setFolderFiles] = useState([]);
  const [isFileScrollHidden, setIsFileScrollHidden] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [files, setFiles] = useState([]);

  const { user, setUser } = useContext(userContext);

  function cancelNewFolder() {
    setIsNewFolder(false);
    setIsRenaming(false);
    setIsFileScrollHidden(false);
  }

  function openFolderOptions(folder: FOLDER) {
    setIsFolderOption(true);
    setSelectedFolder(folder.name);
    setSelectedFolderId(folder._id);
    setIsFileScrollHidden(true);
  }

  function closeFolder() {
    setIsFolderOption(false);
    setSelectedFolder("");
    setIsFileScrollHidden(false);
    setIsRenaming(false);
  }

  const queryClient = useQueryClient();

  function getCurrentFolderDetails(folder: FOLDER) {
    setCurrentFolderDetails((prev) => {
      return { ...prev, id: folder._id, name: folder.name };
    });
  }

  const getMyFolders = async () => {
    if (!user?.isVerified) return;
    return await axios.get(`${urls.folderURL}/my-folders`);
  };
  const { data: folderData, isFetching: isFetchingFolders } = useQuery(
    "MY-FOLDERS",
    getMyFolders,
    {
      refetchOnWindowFocus: false,
      onError: (error) => {
        returnToLoginPage(error);
      },
      retry: false,
    }
  );

  useEffect(() => {
    setFolders(folderData?.data?.myFolders);
  }, [folderData]);

  const getMyFiles = async () => {
    if (!user?.isVerified) return;
    return await axios.get(`${urls.fileURL}/files`);
  };

  const { data: fileData, isFetching: isFetchingFiles } = useQuery(
    "MY-FILES",
    getMyFiles,
    {
      refetchOnWindowFocus: false,
      onError: (error) => {
        returnToLoginPage(error);
      },
      retry: false,
    }
  );
  useEffect(() => {
    setFiles(fileData?.data?.files);
  }, [fileData]);

  const [error, setError] = useState<ERROR_DATA>({
    errorMsg: "",
    isError: false,
  });

  const getMyFolderFiles = async (folderToload: FOLDER) => {
    setMultipleFilesSelected([]);
    getCurrentFolderDetails(folderToload);
    try {
      const url: string = `${urls.fileURL}/files/${folderToload._id}`;
      const { data } = await axios.get(url);
      setFolderFiles(data.files);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data.message.includes("login")) {
          queryClient.clear();
          setUser({
            allocatedSpace: 0,
            usedSpace: 0,
            _id: "",
            name: "",
            email: "",
            isVerified: false,
          });
        } else {
          setError({ errorMsg: error.response?.data.message, isError: true });
        }
      }

      returnToLoginPage(error);
      // console.log(error)
    }
  };

  const [folderToload, setFolderToLoad] = useState<FOLDER | null>({
    _id: "",
    name: "",
  });

  const { refetch, isFetching: isFetchingSelectedFolderFiles } = useQuery(
    ["MY-FOLDER-FILES", folderToload],
    {
      queryFn: () => getMyFolderFiles(folderToload || { _id: "", name: "" }),
      enabled: false,
      retry: false,
    }
  );

  useEffect(() => {
    if (folderToload?._id) {
      refetch();
    }
  }, [folderToload, refetch]);

  const [isFileOption, setIsFileOption] = useState(false);

  const [selectedFile, setSelectedFile] = useState({
    name: "",
    id: "",
    fileSize: 0,
  });

  const [isFolderFileOption, setIsFolderFileOption] = useState(false);
  const [selectedFolderFile, setSelectedFolderFile] = useState({
    fileName: "",
    id: "",
    fileSize: 0,
  });

  function openFileOptions(file: FILE) {
    setIsFileOption(true);
    setSelectedFile((prev) => {
      return {
        ...prev,
        name: file.fileName,
        id: file._id,
        fileSize: file.size,
      };
    });
    setIsFileScrollHidden(true);
  }

  function openFolderFileOptions(file: FILE) {
    setIsFolderFileOption(true);
    setSelectedFolderFile((prev) => {
      return {
        ...prev,
        name: file.fileName,
        id: file._id,
        fileSize: file.size,
      };
    });
    setIsFileScrollHidden(true);
  }

  function closeFileOptions() {
    setIsFileOption(false);
    setIsFileScrollHidden(false);
  }
  function closeFolderFileOptions() {
    setIsFolderFileOption(false);
    setIsFileScrollHidden(false);
  }

  const [uploadError, setUploadError] = useState({
    isError: false,
    errorMsg: "",
  });

  const [uploadPercent, setUploadPercent] = useState<number>(0);

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    setUploadPercent(0);
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      const fileSize = selectedFile.size;
      const formData = new FormData();
      formData.append("file", selectedFile);

      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadPercent(percentCompleted);
        },
      };

      try {
        let uploadRequestLink: string;
        if (currentFolderDetails.id) {
          uploadRequestLink = `${urls.fileURL}/upload/${currentFolderDetails.id}`;
        } else {
          uploadRequestLink = `${urls.fileURL}/upload`;
        }

        await axios.post(`${urls.fileURL}/verify-available-space`, {
          fileSize,
        });

        const { data }: AxiosRequestConfig = await axios.post(
          uploadRequestLink,
          formData,
          config
        );

        if (data.status === "ok") {
          const operation: string = "add";
          const { data } = await axios.patch(
            `${urls.userURL}/update-used-space`,
            { fileSize, operation }
          );
          setUser(data.user);
        }

        if (currentFolderDetails.id) {
          setFolderFiles(data.files);
        } else {
          setFiles(data.files);
        }
        event.target.value = "";
      } catch (error) {
        returnToLoginPage(error);
        event.target.value = "";

        if (axios.isAxiosError(error)) {
          setUploadError({
            isError: true,
            errorMsg: error?.response?.data?.message,
          });
        } else {
          setUploadError({
            isError: true,
            errorMsg: "An error occurred. try again",
          });
        }
      }
    }
  }

  const { mutate: uploadFile, isLoading: isFileUploading } = useMutation(
    handleFileUpload,
    { retry: 0 }
  );

  async function disableLoadingFolderFiles() {
    setFolderFiles([]);
    setFolderToLoad({ name: "", _id: "" });
    setMultipleFilesSelected([]);
    setCurrentFolderDetails({ name: "", id: "" });
    const { data } = await axios.get(`${urls.fileURL}/files`);
    setFiles(data.files);
  }

  interface FileData {
    fileID: string;
    fileSize: number;
  }

  const [multipleFilesSelected, setMultipleFilesSelected] = useState<
    FileData[]
  >([]);

  function selectingMultipleFilesToDelete(file: FILE): void {
    if (!multipleFilesSelected.length) {
      setMultipleFilesSelected([{ fileID: file._id, fileSize: file.size }]);
    } else {
      const isFileSelected = multipleFilesSelected.some(
        (selectedFile) => file._id === selectedFile.fileID
      );

      if (isFileSelected) {
        const updatedFiles = multipleFilesSelected.filter(
          (fileData) => fileData.fileID !== file._id
        );
        setMultipleFilesSelected(updatedFiles);
      } else {
        setMultipleFilesSelected((prevData) => [
          ...prevData,
          { fileID: file._id, fileSize: file.size },
        ]);
      }
    }
  }

  const [isDeletingMultiFilesErr, setIsDeletingMultiFilesErr] =
    useState<boolean>(false);

  async function deleteMultipleFilesHandler(): Promise<void> {
    const operation: string = "delete";
    const fileSize: number = multipleFilesSelected.reduce((acc, current) => {
      return acc + current.fileSize;
    }, 0);
    const urlLink: string = currentFolderDetails.id
      ? `${urls.fileURL}/delete/${currentFolderDetails.id}/delete-files`
      : `${urls.fileURL}/delete/delete-files`;
    try {
      const fileIDs = multipleFilesSelected.map((fileData) => {
        return fileData.fileID;
      });
      const { data } = await axios.delete(urlLink, { data: { fileIDs } });

      if (data.status === "ok") {
        const { data } = await axios.patch(
          `${urls.userURL}/update-used-space`,
          { fileSize, operation }
        );
        setUser(data.user);
      }
      if (currentFolderDetails.id) {
        setFolderFiles(data.files);
      } else {
        setFiles(data.files);
      }
      setMultipleFilesSelected([]);
      setIsDeletingMultiFilesErr(false);
    } catch (error) {
      setMultipleFilesSelected([]);
      setIsDeletingMultiFilesErr(true);
      returnToLoginPage(error);
    }
  }

  const { mutate: deleteMultipleFiles, isLoading: isDeletingMultiFiles } =
    useMutation(deleteMultipleFilesHandler);

  const folderOptionsProps = {
    closeFolder,
    selectedFolder,
    selectedFolderId,
    setFolders,
    setIsRenaming,
    setIsNewFolder,
    setIsFolderOption,
    files,
  };

  const newFolderProps = {
    cancelNewFolder,
    setFolders,
    isRenaming,
    selectedFolderId,
    selectedFolder,
    setSelectedFolder,
    isNewFolder,
  };

  const fileOptionsprops = {
    setIsFileOption,
    closeFileOptions,
    selectedFile,
    setFiles,
    files,
    setIsMoveOpen,
    setIsRenamingFile,
  };
  const folderFileOptionsprops = {
    selectedFolderFile,
    closeFolderFileOptions,
    setFolderFiles,
    folderFiles,
    currentFolderDetails,
    setIsMoveOpen,
    setIsRenamingFolderFile,
  };

  const moveFileProps = {
    folders,
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
  };

  const renameFileProps = {
    setIsRenamingFile,
    selectedFile,
    setFiles,
    setIsFileOption,
  };

  const renameFolderFileProps = {
    selectedFolderFile,
    setFolderFiles,
    setIsRenamingFolderFile,
    setIsFolderFileOption,
  };

  const fileStructureProps = {
    files,
    multipleFilesSelected,
    selectingMultipleFilesToDelete,
    openFileOptions,
  };

  const folderFileStructureProps = {
    folderFiles,
    selectingMultipleFilesToDelete,
    openFolderFileOptions,
    multipleFilesSelected,
  };

  const folderStructureProps = {
    folders,
    setFolderToLoad,
    multipleFilesSelected,
    openFolderOptions,
  };

  return (
    // <main className="dashboard">
    <div className="file-section-container">
      {isFileUploading && (
        <div className="loader-backdrop">
          <div className="loader-container">
            <p>uploading. please wait...</p>
            <div className="progress-container">
              <div
                className="progress"
                style={{
                  width: `${uploadPercent}%`,
                }}
              >
                {uploadPercent}%
              </div>
            </div>
          </div>
        </div>
      )}

      {uploadError.isError && (
        <div>
          <div className="loader-backdrop">
            <div className="loader-container">
              <p className="loader-error-text">{uploadError.errorMsg}</p>
              <p
                className="loader-error-back-btn"
                onClick={() => {
                  setUploadError({ isError: false, errorMsg: "" });
                }}
              >
                &#9001; back
              </p>
            </div>
          </div>
        </div>
      )}

      {isFolderOption && (
        <FolderOptions folderOptionsProps={folderOptionsProps} />
      )}

      {isFileOption && <FileOptions fileOptionsProps={fileOptionsprops} />}

      {isFolderFileOption && (
        <FolderFileOptions folderFileOptionsProps={folderFileOptionsprops} />
      )}

      {isNewFolder && <NewFolder newFolderProps={newFolderProps} />}

      {isRenamingFile && <RenameFile renameFileProps={renameFileProps} />}

      {isRenamingFolderFile && (
        <RenameFolderFile renameFolderFileProps={renameFolderFileProps} />
      )}

      {isMoveOpen && <MoveFile moveFileProps={moveFileProps} />}
      <section className="dashboard-filename-section">
        {!currentFolderDetails.name && (
          <div className="new-folder" onClick={() => setIsNewFolder(true)}>
            <CreateFolderIcon />
            <p>new folder</p>
          </div>
        )}
        <label className="upload-file">
          Upload
          <input type="file" onChange={uploadFile} />
          <UploadIcon />
        </label>
      </section>
      <div className="rename-delete-container">
        {multipleFilesSelected.length > 0 && (
          <button
            className="delete-all-button"
            onClick={() => {
              deleteMultipleFiles();
            }}
          >
            {isDeletingMultiFiles ? (
              <SmallLoader />
            ) : (
              `Delete selected files(${multipleFilesSelected.length})`
            )}
          </button>
        )}

        {multipleFilesSelected.length > 0 && (
          <button
            className="move-all-button"
            onClick={() => {
              setIsMoveOpen(true);
            }}
          >
            Move selected files({multipleFilesSelected.length})
          </button>
        )}
      </div>
      {isDeletingMultiFilesErr && (
        <p
          style={{
            width: "100%",
            textAlign: "center",
            color: "rgb(232, 60, 60)",
          }}
        >
          Error: Try again later
        </p>
      )}

      <section className="folder-tracker">
        <p className="current-folder">{`dashboard/${currentFolderDetails.name}`}</p>
        {currentFolderDetails.name && (
          <p className="folder-back" onClick={disableLoadingFolderFiles}>
            back
          </p>
        )}
      </section>

      <section
        style={{ overflow: isFileScrollHidden ? "hidden" : "scroll" }}
        className="dashboard-file-section"
      >
        {isFetchingFiles && isFetchingFolders && <Loader />}
        {user?._id &&
          !folders?.length &&
          !files?.length &&
          !isFetchingFiles &&
          !isFetchingFolders && (
            <p className="empty-dashboard-text">
              {user?.isVerified
                ? "Nothing to see here. Get started by uploading files or creating folder"
                : "Please verify your email to continue"}
            </p>
          )}
        {!currentFolderDetails.name &&
          !isFetchingFiles &&
          !isFetchingFolders &&
          folders && <FolderTSX folderStructureProps={folderStructureProps} />}
        {isFetchingFiles || (isFetchingFolders && <Loader />)}
        {!currentFolderDetails.name &&
          !isFetchingFiles &&
          !isFetchingFolders &&
          files && <FileTSX fileStructureProps={fileStructureProps} />}

        {currentFolderDetails.name && isFetchingSelectedFolderFiles && (
          <Loader />
        )}

        {!isFetchingSelectedFolderFiles &&
          currentFolderDetails.name &&
          folderFiles.length === 0 &&
          !error.isError && (
            <p className="empty-folder-text">Folder is empty</p>
          )}

        {currentFolderDetails.name && error.isError && (
          <p className="folder-file-error">{error.errorMsg}</p>
        )}

        {currentFolderDetails.name && (
          <FolderFileJSX folderFileStructureProps={folderFileStructureProps} />
        )}
      </section>
    </div>
  );
}

export default FileSection;
