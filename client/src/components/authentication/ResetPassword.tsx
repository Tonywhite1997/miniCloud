import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import urls from "../../utils/authURL";
import SmallLoader from "../../UI/SmallLoader";

interface ERROR {
  isError: boolean;
  errorMsg: string;
}

function ResetPassword() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resetCode, setResetCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [error, setError] = useState<ERROR>({
    isError: false,
    errorMsg: "",
  });
  const [isSucccess, setIsSuccess] = useState(false);

  function collectResetCode(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    const { value } = e.target;
    setResetCode(value);
  }
  function collectNewPassword(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    const { value } = e.target;
    setNewPassword(value);
  }

  const navigate = useNavigate();

  async function confirmResetCode() {
    setIsLoading(true);
    setError({ isError: false, errorMsg: "" });
    try {
      await axios.post(`${urls.authURL}/reset-password`, {
        resetCode,
        newPassword,
      });
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        navigate("/auth/login");
      }, 3000);
    } catch (error) {
      setIsLoading(false);

      if (axios.isAxiosError(error)) {
        setError({ isError: true, errorMsg: error?.response?.data?.message });
      } else {
        setError({ isError: true, errorMsg: "something occured. try again" });
      }
    }
    setResetCode("");
  }

  return (
    <div className="forgot-password-page">
      <label htmlFor="reset-password">
        <h3>Enter the code sent to your email and your new password below</h3>
      </label>
      {isSucccess && (
        <p
          style={{
            padding: ".1em .6em",
            backgroundColor: "green",
            borderRadius: ".2em",
            marginBottom: "1em",
            color: "white",
          }}
        >
          Your password has been reset successfully <span>&#10003;</span>
        </p>
      )}

      <input
        id="reset-password"
        placeholder="reset code"
        name="reset-code"
        value={resetCode}
        onChange={collectResetCode}
      />
      <input
        id="new-password"
        type="password"
        placeholder="new password"
        name="new-password"
        value={newPassword}
        onChange={collectNewPassword}
      />

      {error.isError && <p className="error-msg">{error.errorMsg}</p>}
      <button
        onClick={() => {
          !isLoading && confirmResetCode();
        }}
      >
        {isLoading ? <SmallLoader /> : "confirm"}
      </button>
    </div>
  );
}

export default ResetPassword;
