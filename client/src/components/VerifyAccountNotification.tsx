import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SmallLoader from "../UI/SmallLoader";
import urls from "../utils/authURL";

interface ERROR {
  isError: boolean;
  errorMsg: string;
}

function VerifyAccountNotification() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [error, setError] = useState<ERROR>({ isError: false, errorMsg: "" });

  const navigate = useNavigate();

  async function sendVerificationCode() {
    setIsLoading(true);
    setError({ isError: false, errorMsg: "" });

    try {
      await axios.get(`${urls.authURL}/send-email-verification`);
      navigate("/auth/verify-account");
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);

      if (axios.isAxiosError(error)) {
        setError({
          isError: true,
          errorMsg: error?.response?.data.message,
        });
      } else {
        setError({ isError: true, errorMsg: "something occured" });
      }
    }
  }
  return (
    <div className="email-verification">
      <div className="action">
        <p>We need you to verify that you own this email</p>
        <button className="verify-btn" onClick={sendVerificationCode}>
          {isLoading ? <SmallLoader /> : "verify"}
        </button>
      </div>
      {error.isError && <p className="error-msg">{error.errorMsg}</p>}
    </div>
  );
}

export default VerifyAccountNotification;
