import urls from "../authURL";

export function returnToLoginPage(error) {
  if (
    error?.response?.data?.message?.includes("Token expired") ||
    error?.response?.data?.message?.includes("invalid token")
  ) {
    window.location.assign(`${urls.authURL}/login`);
  }
}
