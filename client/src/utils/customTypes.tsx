import { Dispatch, SetStateAction } from "react";

export interface FOLDER {
  name: string;
  _id: string;
}
export interface FILE {
  fileName: string;
  _id: string;
  link: string;
  size: number;
  folder: string;
  mimetype: string;
}

export interface UserContextType {
  user: USER;
  isLoading: boolean;
  setUser: Dispatch<SetStateAction<USER>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  isError: boolean;
}
export interface FileContextType {
  fileProviderData: FILE;
  setFileProviderData: Dispatch<SetStateAction<FILE>>;
}

export interface FileDataType {
  fileID: string;
  fileSize: number;
}

export interface ERROR {
  response: {
    data: {
      message: string;
    };
  };
}

export interface PASSWORD_ERROR {
  isError: boolean;
  errorMsg: string;
}

export interface NEW_PASSWORD {
  currentPassword: string;
  newPassword: string;
}

export interface ERROR_DATA {
  isError: boolean;
  errorMsg: string;
}

export interface USER {
  allocatedSpace: number;
  usedSpace: number;
  createdAt?: string;
  _id?: string;
  name: string;
  email: string;
  id?: string;
  isVerified: boolean;
}

export interface USER_TYPE {
  user: USER;
  setUser: Dispatch<SetStateAction<USER>>;
}
