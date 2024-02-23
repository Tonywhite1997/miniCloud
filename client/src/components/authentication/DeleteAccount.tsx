import axios from "axios";
import React, { useState } from "react";
import { useMutation } from "react-query";
import urls from "../../utils/authURL";
import { PASSWORD_ERROR } from "../../utils/customTypes";
import { returnToLoginPage } from "../../utils/generalCommands/ReturnToLoginPage";
import SmallLoader from "../../UI/SmallLoader";
import { Link } from "react-router-dom";

function DeleteAccount() {
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<PASSWORD_ERROR>({
    isError: false,
    errorMsg: "",
  });
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  function collectUserPassword(e: React.ChangeEvent<HTMLInputElement>) {
    setError({ isError: false, errorMsg: "" });
    const { value } = e.target;
    setPassword(value);
  }

  async function deleteAccountHandler() {
    setIsSuccess(false);
    try {
      await axios.delete(`${urls.userURL}/delete-account`, {
        data: {
          password: password,
        },
      });

      await axios.get(`${urls.authURL}/logout`);

      setIsSuccess(true);

      setTimeout(() => {
        window.location.assign("/auth/login");
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

  const { mutate: deleteAccount, isLoading } =
    useMutation(deleteAccountHandler);

  return (
    <div className="delete-account-container">
      {isSuccess && !error.isError && (
        <p className="success-message">
          <span>&#10003;</span>Account deleted Successfully
        </p>
      )}
      <p className="warning">
        Deleting your account will erase all your data including all the files
        you have saved.
      </p>
      <div className="password-field">
        <label htmlFor="delete-account">Input your password to continue</label>
        <input
          type="password"
          id="delete-account"
          placeholder="password"
          value={password}
          onChange={collectUserPassword}
        />
      </div>
      {error.isError && <p className="error-msg">{error.errorMsg}</p>}
      <div className="buttons">
        <button>
          <Link to="/auth/login" className="delete-account-link">
            Cancel
          </Link>
        </button>
        <button
          className="delete-btn"
          onClick={() => {
            deleteAccount();
          }}
        >
          {isLoading ? <SmallLoader /> : "Delete"}
        </button>
      </div>
    </div>
  );
}

export default DeleteAccount;
