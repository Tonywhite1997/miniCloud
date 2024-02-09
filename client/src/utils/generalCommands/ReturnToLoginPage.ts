export function returnToLoginPage(error) {
  if (error?.response?.data?.message?.includes("Token expired")) {
    window.location.assign("/auth/login");
  }
}
