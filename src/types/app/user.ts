import { BaseResponse } from "../common";

export interface User {
  id: number;
  name: string;
  isActive: boolean;
  isSuperUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginDTO {
  name: string;
  password: string;
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

interface LoginRes {
  accessToken: string;
  user: User;
}
export type LoginResponse = BaseResponse<LoginRes>;

// First Time Setup
export interface FirstTimeSetupDTO {
  name: string;
  password: string;
}

export interface UserStatus {
  hasUsers: boolean;
  userCount: number;
}

export type UserStatusResponse = BaseResponse<UserStatus>;
