import urls from "./authURL";
import axios from "axios";
import { returnToLoginPage } from "./generalCommands/ReturnToLoginPage";

export async function downloadFileSetup(
  selectedObject,
  closeObjectOptions,
  setIsDownloadError,
  setIsDownloadLoading
) {
  const { id, name } = selectedObject;
  setIsDownloadError(false);
  setIsDownloadLoading(true);
  try {
    const response = await axios.get(`${urls.fileURL}/download/${id}`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    setIsDownloadLoading(false);
    closeObjectOptions();
  } catch (error) {
    setIsDownloadLoading(false);
    setIsDownloadError(true);
    returnToLoginPage(error);
  }
}
