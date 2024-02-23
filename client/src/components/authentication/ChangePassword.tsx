import axios from "axios";
import React, { useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import urls from "../../utils/authURL";
import { returnToLoginPage } from "../../utils/generalCommands/ReturnToLoginPage";
import { PASSWORD_ERROR, NEW_PASSWORD } from "../../utils/customTypes";
import SmallLoader from "../../UI/SmallLoader";
import { Link } from "react-router-dom";

function ChangePassword() {
  const [newPasswordInfo, setNewPasswordInfo] = useState<NEW_PASSWORD>({
    currentPassword: "",
    newPassword: "",
  });

  const [error, setError] = useState<PASSWORD_ERROR>({
    isError: false,
    errorMsg: "",
  });
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  function collectNewPasswordInfo(e: React.ChangeEvent<HTMLInputElement>) {
    setError({ isError: false, errorMsg: "" });
    const { name, value } = e.target;

    setNewPasswordInfo((prevData) => {
      return { ...prevData, [name]: value.trimEnd() };
    });
  }

  const navigate = useNavigate();

  async function changePasswordHandler() {
    setError({ isError: false, errorMsg: "" });
    setIsSuccess(false);
    try {
      await axios.patch(`${urls.userURL}/change-password`, newPasswordInfo);
      setNewPasswordInfo({ newPassword: "", currentPassword: "" });
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/auth/login");
      }, 3000);
    } catch (error) {
      returnToLoginPage(error);

      if (axios.isAxiosError(error)) {
        setError({ isError: true, errorMsg: error?.response?.data?.message });
      } else {
        setError({ isError: true, errorMsg: "something occured. try again" });
      }
    }
  }

  const { mutate: changePassword, isLoading } = useMutation(
    changePasswordHandler
  );

  return (
    <div className="change-password-container">
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        {isSuccess && !error.isError && (
          <p className="success-msg">
            <span>&#10003;</span>Password changed Successfully
          </p>
        )}
        <div className="old-password-container">
          <label htmlFor="old-password">Current Password</label>
          <input
            type="password"
            placeholder="current password"
            name="currentPassword"
            value={newPasswordInfo.currentPassword}
            onChange={collectNewPasswordInfo}
          />
        </div>
        <div className="new-password-container">
          <label htmlFor="new-password">New Password</label>
          <input
            type="password"
            placeholder="new password"
            name="newPassword"
            value={newPasswordInfo.newPassword}
            onChange={collectNewPasswordInfo}
          />
        </div>
        {error.isError && <p className="error-msg">{error.errorMsg}</p>}
        <div className="buttons">
          <Link to="/auth/login" className="change-password-link">
            cancel
          </Link>

          <button
            className="continue-btn"
            onClick={(e) => {
              e.preventDefault();
              changePassword();
            }}
          >
            {isLoading ? <SmallLoader /> : "continue"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChangePassword;
