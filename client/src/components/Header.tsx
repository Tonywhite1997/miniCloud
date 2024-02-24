import React, { useContext } from "react";
import { useQueryClient } from "react-query";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import CloudIcon from "../assets/CloudIcon";
import { userContext } from "../utils/context";
import urls from "../utils/authURL";
import { returnToLoginPage } from "../utils/generalCommands/ReturnToLoginPage";
import SmallLoader from "../UI/SmallLoader";

function Header() {
  const { user, setUser, isLoading, setIsLoading } = useContext(userContext);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function logout() {
    setIsLoading(true);
    try {
      await axios.get(`${urls.authURL}/logout`);
      queryClient.clear();
      setUser({
        allocatedSpace: 0,
        usedSpace: 0,
        _id: "",
        name: "",
        email: "",
        isVerified: false,
      });
      setIsLoading(false);
      navigate("/auth/login");
    } catch (error) {
      setIsLoading(false);
      returnToLoginPage(error);
    }
  }

  return (
    <header className="header">
      <div className="header-logo">
        <Link to="/user/dashboard" className="logo-link">
          <CloudIcon />
          <p>MiniCloud</p>
        </Link>
      </div>
      {user?._id && (
        <p className="logout-btn" onClick={logout}>
          {isLoading ? <SmallLoader /> : "Logout"}
        </p>
      )}
    </header>
  );
}

export default Header;
