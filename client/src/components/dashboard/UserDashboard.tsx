import React, { useContext, useEffect, useState } from "react";

import FileSection from "./dashboard-sections/FileSection";
import UserDetailsSection from "./dashboard-sections/UserDetailsSection";
import Navigation from "./dashboard-sections/Navigation";
import { userContext } from "../../utils/context";
import VerifyAccountNotification from "../VerifyAccountNotification";
import OpenNavIcon from "../../assets/OpenNavIcon";
import CancelIcon from "../../assets/CancelIcon";

function UserDashboard() {
  const { user, isLoading } = useContext(userContext);
  const [currentNav, setCurrentNav] = useState<number>(0);
  const [isnavOpen, setIsNavOpen] = useState<boolean>(false);
  const [clientWidth, setClientWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    window.addEventListener("resize", () => {
      setClientWidth(window.innerWidth);
    });
    return () => {
      window.removeEventListener("resize", () => {
        setClientWidth(window.innerWidth);
      });
    };
  }, []);

  useEffect(() => {
    if (!isLoading && !user?._id) {
      window.location.assign("/auth/login");
    }
  }, [user?._id, isLoading]);

  const isVerified = user?.isVerified || false;

  // if (!user._id)
  return (
    <main className="dashboard">
      {user?._id && !isVerified && <VerifyAccountNotification />}
      {clientWidth < 650 && (
        <div className="nav-icons-container">
          <div
            className="open-nav-container"
            onClick={() => setIsNavOpen((currentState) => !currentState)}
          >
            {!isnavOpen && <OpenNavIcon />}
          </div>

          <div
            className="close-nav-container"
            onClick={() => setIsNavOpen((currentState) => !currentState)}
          >
            {isnavOpen && <CancelIcon />}
          </div>
        </div>
      )}
      <div
        className="dashboard-action-section"
        style={{ height: isVerified && "100%" }}
      >
        {isnavOpen && clientWidth < 650 && (
          <Navigation
            handleCurrentNav={setCurrentNav}
            currentNav={currentNav}
            handleNavOpen={setIsNavOpen}
          />
        )}
        {!isnavOpen && clientWidth >= 650 && (
          <Navigation
            handleCurrentNav={setCurrentNav}
            currentNav={currentNav}
            handleNavOpen={setIsNavOpen}
          />
        )}

        <div className="container">
          {currentNav === 0 && <FileSection />}
          {currentNav === 1 && <UserDetailsSection />}
        </div>
      </div>
    </main>
  );
}

export default UserDashboard;
