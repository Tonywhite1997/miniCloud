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
  error: string;
}

export interface USER {
  allocatedSpace: number;
  usedSpace: number;
  createdAt: Date;
  _id: string;
  name: string;
  email: string;
  id: string;
}

export interface USER_TYPE {
  user: USER;
  setUser: Dispatch<SetStateAction<USER_TYPE>>;
}
