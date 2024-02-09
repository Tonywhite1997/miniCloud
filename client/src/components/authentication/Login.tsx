import React, { useState, useEffect, useContext } from "react";
import { useMutation } from "react-query";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import urls from "../../utils/authURL";
import { userContext } from "../../utils/context";
import SmallLoader from "../../UI/SmallLoader";
import { ERROR_DATA, ERROR } from "../../utils/customTypes";

function Login() {
  const { user, setUser, isLoading, setIsLoading } = useContext(userContext);

  const [errorData, setErrorData] = useState<ERROR_DATA>({
    isError: false,
    error: "",
  });

  const navigate = useNavigate();
  const [userLoginData, setUserLoginData] = useState({
    email: "",
    password: "",
  });
  function getUserLoginData(event: React.ChangeEvent<HTMLInputElement>) {
    const { name } = event.target;
    const { value } = event.target;
    setUserLoginData((prevData) => {
      return { ...prevData, [name]: value.trimEnd() };
    });
  }

  const handleLogin = async () => {
    setErrorData({ isError: false, error: "" });
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${urls.authURL}/login`,
        userLoginData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setIsLoading(false);
      return response;
    } catch (error) {
      setIsLoading(false);
      setErrorData({ isError: true, error: error?.response?.data.message });
    }
  };

  const { data, mutate: login } = useMutation(handleLogin);

  useEffect(() => {
    setUser(data?.data.user);
  }, [setUser, data]);

  useEffect(() => {
    if (user?._id && !errorData.isError) {
      navigate("/user/dashboard");
    }
  }, [user?._id, navigate, errorData.isError]);

  return (
    <section className="login-section">
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault(), login();
        }}
      >
        <h3>Sign In</h3>
        <div className="input-container">
          <label>Email</label>
          <input
            type="email"
            placeholder="Your Email"
            name="email"
            value={userLoginData.email}
            onChange={getUserLoginData}
          />
        </div>
        <div className="input-container">
          <label>Password</label>
          <input
            type="password"
            placeholder="Your Password"
            name="password"
            value={userLoginData.password}
            onChange={getUserLoginData}
          />
        </div>
        {errorData.isError && <p className="login-error">{errorData.error}</p>}
        <div className="button">
          <button>{isLoading ? <SmallLoader /> : "Login"}</button>
        </div>
        <div className="options-container">
          <Link to="/auth/forgot-password">forgot password?</Link>
          <p className="signup-option">
            Don't have an account? <Link to="/auth/register">signup</Link>
          </p>
        </div>
      </form>
    </section>
  );
}

export default Login;
