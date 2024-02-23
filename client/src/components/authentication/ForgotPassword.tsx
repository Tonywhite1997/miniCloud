import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SmallLoader from "../../UI/SmallLoader";
import urls from "../../utils/authURL";

interface ERROR {
  isError: boolean;
  errorMsg: string;
}

function ForgotPassword() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");

  const [error, setError] = useState<ERROR>({ isError: false, errorMsg: "" });

  function collectUserEmail(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    const { value } = e.target;
    setEmail(value);
  }

  const navigate = useNavigate();

  async function ConfirmUserEmail() {
    setError({ isError: false, errorMsg: "" });
    setIsLoading(true);

    try {
      await axios.post(`${urls.authURL}/forgot-password`, { email });
      setIsLoading(false);
      navigate("/auth/reset-password");
    } catch (error) {
      setIsLoading(false);
      if (axios.isAxiosError(error)) {
        setError({ isError: true, errorMsg: error?.response?.data?.message });
      } else {
        setError({ isError: true, errorMsg: "something occured. try again" });
      }
    }
  }

  return (
    <div className="forgot-password-page">
      <label htmlFor="forgot-password">
        <h2>Enter your registered email for assistance</h2>
      </label>

      <input
        type="email"
        id="forgot-password"
        placeholder="registered email"
        name="email"
        value={email}
        onChange={collectUserEmail}
      />

      {error.isError && <p className="error-msg">{error.errorMsg}</p>}
      <button
        onClick={() => {
          !isLoading && ConfirmUserEmail();
        }}
      >
        {isLoading ? <SmallLoader /> : "Confirm"}
      </button>
    </div>
  );
}

export default ForgotPassword;
