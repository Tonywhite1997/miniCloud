import React from "react";
import { Link } from "react-router-dom";
import LockIcon from "../../../assets/LockIcon";
import ProfileIcon from "../../../assets/ProfileIcon";
import DatabaseIcon from "../../../assets/DatabaseIcon";
import ShareIcon from "../../../assets/ShareIcon";

function Navigation({ handleCurrentNav, currentNav, handleNavOpen }) {
  const databasestyle = {
    backgroundColor: currentNav === 0 ? "rgb(42, 219, 110)" : "initial",
  };
  const profileStyle = {
    backgroundColor: currentNav === 1 ? "rgb(42, 219, 110)" : "initial",
  };

  function exitNavBar() {
    return handleNavOpen(false);
  }

  return (
    <nav className="navigation">
      <ul>
        <li
          style={databasestyle}
          onClick={() => {
            handleCurrentNav(0);
            exitNavBar();
          }}
        >
          <span>
            <DatabaseIcon />
          </span>
          Database
        </li>
        <li
          style={profileStyle}
          onClick={() => {
            handleCurrentNav(1);
            exitNavBar();
          }}
        >
          <span>
            <ProfileIcon />
          </span>
          Profile
        </li>
        <Link to="/share-file/dashboard" className="shared-file-link link">
          <span>
            <ShareIcon />
          </span>
          Shared Files
        </Link>
        <li className="authentication">
          <span>
            <LockIcon />
          </span>
          Authentication
        </li>
        <li className="auth-1">
          <Link to="/auth/change-password" className="link">
            Change Password
          </Link>
        </li>
        <li className="auth-2">
          <Link to="/auth/delete-account" className="link">
            Delete Account
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
