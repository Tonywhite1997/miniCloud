import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import Header from "./components/Header";
import Login from "./components/authentication/Login";
import SignUp from "./components/authentication/SignUp";
import UserDashboard from "./components/dashboard/UserDashboard";
import { UserProvider } from "./utils/context";
import { FileProvider } from "./utils/context";
import DisplayFilePage from "./components/DisplayFilePage";
import ForgotPassword from "./components/authentication/ForgotPassword";
import ResetPassword from "./components/authentication/ResetPassword";
import VerifyAccount from "./components/authentication/emailVerification/VerifyAccount";
import ChangePassword from "./components/authentication/ChangePassword";
import DeleteAccount from "./components/authentication/DeleteAccount";
import ShareFile from "./components/dashboard/sharedFIle/ShareFile";
import ShareFileDashboard from "./components/dashboard/sharedFIle/ShareFileDashboard";
import SharedFileDetails from "./components/dashboard/sharedFIle/SharedFileDetails";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <UserProvider>
          <FileProvider>
            <Header />
            <Routes>
              <Route path="/" element={<Login />} />

              <Route path="/auth/register" element={<SignUp />} />

              <Route path="/auth/login" element={<Login />} />

              <Route
                path="/auth/verify-account"
                element={<VerifyAccount />}
              ></Route>

              <Route path="/user/dashboard" element={<UserDashboard />} />

              <Route
                path="/files/:fileID/display"
                element={<DisplayFilePage />}
              />

              <Route
                path="/share-files/:fileID/display"
                element={<DisplayFilePage />}
              />

              <Route
                path="/auth/forgot-password"
                element={<ForgotPassword />}
              />

              <Route
                path="/file/share-file/:fileID/:filename"
                element={<ShareFile />}
              />

              <Route
                path="/share-file/dashboard"
                element={<ShareFileDashboard />}
              />

              <Route
                path="/share-file/dashboard/:fileID"
                element={<SharedFileDetails />}
              />

              <Route
                path="/auth/change-password"
                element={<ChangePassword />}
              />

              <Route path="/auth/delete-account" element={<DeleteAccount />} />

              <Route path="/auth/reset-password" element={<ResetPassword />} />
            </Routes>
          </FileProvider>
        </UserProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
