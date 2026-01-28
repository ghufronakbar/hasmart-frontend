import { BaseResponse } from "../common";

export interface User {
  id: number;
  name: string;
  isActive: boolean;
  isSuperUser: boolean;
}

export interface LoginDTO {
  name: string;
  password: string;
}

export interface UserStatus {
  hasUsers: boolean;
  userCount: number;
}

export interface FirstTimeSetupDTO {
  name: string;
  password: string;
}

export interface CreateUserDTO {
  name: string;
  password: string;
  isActive?: boolean;
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
}

export type AuthResponse = BaseResponse<AuthResponseData>;
export type UserStatusResponse = BaseResponse<UserStatus>;
export type UserResponse = BaseResponse<User>;
export type WhoAmIResponse = BaseResponse<User>;
export type UserListResponse = BaseResponse<User[]>; // For listing users (if added later)
