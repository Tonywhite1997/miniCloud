import React, { createContext, ReactNode, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useQuery } from "react-query";
import urls from "./authURL";
import Loader from "../UI/Loader";
import { FILE, FileContextType, USER, UserContextType } from "./customTypes";
import { returnToLoginPage } from "./generalCommands/ReturnToLoginPage";

const initialUser = {
  allocatedSpace: 0,
  usedSpace: 0,
  _id: "",
  name: "",
  email: "",
  isVerified: false,
};
const initialFile = {
  fileName: "",
  _id: "",
  link: "",
  size: 0,
  folder: "",
  mimetype: "",
};

export const userContext = createContext<UserContextType>({
  isLoading: false,
  user: initialUser,
  setIsLoading: () => {
    false;
  },
  setUser: () => {},
  isError: false,
});

export const fileContext = createContext<FileContextType>({
  fileProviderData: initialFile,
  setFileProviderData: () => {
    initialFile;
  },
});

interface ChildrenProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: ChildrenProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const [user, setUser] = useState<USER>(initialUser);

  const persistLogin = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${urls.authURL}/check-if-login`);
      setUser(data?.user);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setIsError(true);
      returnToLoginPage(error);
    }
  };
  const location = useLocation();

  let shouldAuthCheckRun =
    !location.pathname.includes("/auth/login") ||
    !location.pathname.includes("/auth/register");

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

export const FileProvider = ({ children }: ChildrenProps) => {
  const [fileProviderData, setFileProviderData] = useState<FILE>(initialFile);

  return (
    <fileContext.Provider value={{ fileProviderData, setFileProviderData }}>
      {children}
    </fileContext.Provider>
  );
};
