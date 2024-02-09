import React, { createContext, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useQuery } from "react-query";
import urls from "./authURL";
import Loader from "../UI/Loader";

export const userContext = createContext({});
export const fileContext = createContext({});

export const UserProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  interface userType {
    _id?: string;
  }
  const [user, setUser] = useState<userType>({});

  const persistLogin = async () => {
    // if (user?._id) return;
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${urls.authURL}/check-if-login`);
      setUser(data?.user);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setIsError(true);
    }
  };
  const location = useLocation();
  const shouldAuthCheckRun = location.pathname.includes("/user/dashboard");

  const { isLoading: queryLoading, isFetching } = useQuery(
    "PERSIST-LOGIN-DATA",
    persistLogin,
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      enabled: shouldAuthCheckRun,
    }
  );

  if (queryLoading || isFetching) {
    return <Loader />;
  }

  return (
    <userContext.Provider
      value={{ user, setUser, isLoading, setIsLoading, isError }}
    >
      {children}
    </userContext.Provider>
  );
};

export const FileProvider = ({ children }) => {
  const [fileProviderData, setFileProviderData] = useState({});

  return (
    <fileContext.Provider value={{ fileProviderData, setFileProviderData }}>
      {children}
    </fileContext.Provider>
  );
};
