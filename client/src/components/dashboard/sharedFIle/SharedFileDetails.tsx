import axios from "axios";
import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import urls from "../../../utils/authURL";
import { ERROR_DATA } from "../../../utils/customTypes";
import { userContext } from "../../../utils/context";
import { returnToLoginPage } from "../../../utils/generalCommands/ReturnToLoginPage";
import OwnerSection from "./OwnerSection";
import RecipientSection from "./recipient/RecipientSection";
import Loader from "../../../UI/Loader";
import RenameDialog from "./recipient/RenameDialog";

RecipientSection;
function SharedFileDetails() {
  const { user } = useContext(userContext);
  const [error, setError] = useState<ERROR_DATA>({
    isError: false,
    errorMsg: "",
  });
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [file, setFile] = useState({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { fileID } = useParams();

  useQuery("SHARED_FILE", {
    queryFn: async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(
          `${urls.sharedFileURL}/file/${fileID}`
        );
        setFile(data.file);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        setError({ isError: true, errorMsg: error?.response?.data.message });
        returnToLoginPage(error);
      }
    },
    refetchOnWindowFocus: false,
  });

  return (
    <main className="shared-file-details">
      {isLoading && <Loader />}
      {!isLoading && error.isError && (
        <p className="error-msg">{error.errorMsg}</p>
      )}

      {isRenaming && (
        <RenameDialog setOpenSharedFileRename={setIsRenaming} file={file} />
      )}

      {!isLoading && user?._id === file?.owner && <OwnerSection file={file} />}
      {!isLoading && user?._id === file?.recipient && (
        <RecipientSection file={file} setIsRenaming={setIsRenaming} />
      )}
    </main>
  );
}

export default SharedFileDetails;
