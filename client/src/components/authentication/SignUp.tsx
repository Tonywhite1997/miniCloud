import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import SmallLoader from "../../UI/SmallLoader";
import urls from "../../utils/authURL";

function SignUp() {
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState({ isError: false, errorMsg: "" });
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  function getUserData(event: React.ChangeEvent<HTMLInputElement>): void {
    const value: string = event.target.value;
    const name: string = event.target.name;
    setNewUserData((prevData) => {
      return { ...prevData, [name]: value };
    });
  }

  const formattedName = {
    ...newUserData,
    name: newUserData.name
      .split(" ")
      .map((word) => {
        return `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`;
      })
      .join(" "),
  };

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function registerNewUser() {
    setIsSuccess(false);
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${urls.authURL}/register`,
        formattedName,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setIsLoading(false);
      setIsSuccess(true);
      return response;
    } catch (error) {
      setIsLoading(false);

      if (axios.isAxiosError(error)) {
        setError({ isError: true, errorMsg: error?.response?.data?.message });
      } else {
        setError({ isError: true, errorMsg: "something occured. try again" });
      }
    }
  }

  const { data, refetch } = useQuery("USER_SIGNUP", {
    queryFn: registerNewUser,
    enabled: false,
    retry: 1,
  });

  useEffect(() => {
    if (data?.status === 200) {
      setTimeout(() => {
        setIsSuccess(false);
        navigate("/auth/login");
        queryClient.removeQueries({ queryKey: "USER_SIGNUP" });
      }, 3000);
    }
  }, [data, navigate, queryClient]);

  return (
    <section className="signup-section">
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault(), refetch();
        }}
      >
        <h3>Sign Up</h3>
        {isSuccess && (
          <p className="success-msg">
            &#10003; Account successfully registered
          </p>
        )}
        <div className="input-container">
          <label>Name</label>
          <input
            type="text"
            placeholder="Your Name"
            name="name"
            value={newUserData.name}
            onChange={getUserData}
          />
        </div>
        <div className="input-container">
          <label>Email</label>
          <input
            type="email"
            placeholder="Your Email"
            name="email"
            value={newUserData.email}
            onChange={getUserData}
          />
        </div>
        <div className="input-container">
          <label>Password</label>
          <input
            type="password"
            placeholder="Your Password"
            name="password"
            value={newUserData.password}
            onChange={getUserData}
          />
        </div>
        {error.isError && <p className="signup-error">{error.errorMsg}</p>}
        <div className="button">
          <button>{isLoading ? <SmallLoader /> : "Sign Up"}</button>
        </div>
        <p className="login-option">
          Already a user? <Link to="/auth/login">login</Link>
        </p>
      </form>
    </section>
  );
}

export default SignUp;
