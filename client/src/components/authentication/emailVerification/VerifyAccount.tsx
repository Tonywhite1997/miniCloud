import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SmallLoader from "../../../UI/SmallLoader";
import urls from "../../../utils/authURL";

interface ERROR {
  isError: boolean;
  errorMsg: string;
}

function VerifyAccount() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>("");

  const [error, setError] = useState<ERROR>({ isError: false, errorMsg: "" });

  function collectVerificationCode(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    const { value } = e.target;
    setVerificationCode(value);
  }

  const navigate = useNavigate();

  async function ConfirmVerificationCode() {
    setError({ isError: false, errorMsg: "" });
    setIsLoading(true);

    try {
      await axios.post(`${urls.authURL}/confirm-verification-code`, {
        verificationCode,
      });
      setIsLoading(false);
      navigate("/user/dashboard");
    } catch (error) {
      setIsLoading(false);
      setVerificationCode("");
      setError({ isError: true, errorMsg: error?.response?.data?.message });
    }
  }

  return (
    <div className="forgot-password-page">
      <label htmlFor="verification-code">
        <h2>Enter the verifcation code sent to your email</h2>
      </label>
      <input
        id="verification-code"
        placeholder="verification code"
        name="verification-code"
        value={verificationCode}
        onChange={collectVerificationCode}
      />
      {error.isError && <p className="error-msg">{error.errorMsg}</p>}
      <button
        onClick={() => {
          !isLoading && ConfirmVerificationCode();
        }}
      >
        {isLoading ? <SmallLoader /> : "Confirm"}
      </button>
    </div>
  );
}

export default VerifyAccount;
