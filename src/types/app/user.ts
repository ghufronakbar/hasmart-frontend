import { BaseResponse } from "../common";

export interface User {
  id: number;
  name: string;
  isActive: boolean;
  isSuperUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  name: string;
  password?: string;
  isActive: boolean;
}

export interface ResetPasswordDTO {
  newPassword: string;
}

export interface EditProfileDTO {
  name: string;
}

export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
}

export type UserResponse = BaseResponse<User>;
export type UserListResponse = BaseResponse<User[]>;
