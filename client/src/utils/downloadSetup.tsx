import axios from "axios";
import { returnToLoginPage } from "./generalCommands/ReturnToLoginPage";

export async function downloadFileSetup(
  donwloadURL,
  selectedObject,
  setIsDownloadError,
  setIsDownloadLoading,
  closeObjectOptions?
) {
  const { name } = selectedObject;
  setIsDownloadError(false);
  setIsDownloadLoading(true);
  try {
    const response = await axios.get(donwloadURL, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);

    a.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      })
    );

    document.body.removeChild(a);

    setIsDownloadLoading(false);
    closeObjectOptions();
  } catch (error) {
    setIsDownloadLoading(false);
    setIsDownloadError(true);
    returnToLoginPage(error);
  }
}
