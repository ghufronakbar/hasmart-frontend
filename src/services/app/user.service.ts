import { axiosInstance } from "@/lib/axios";
import {
  AuthResponse,
  CreateUserDTO,
  FirstTimeSetupDTO,
  LoginDTO,
  UserStatusResponse,
  WhoAmIResponse,
} from "@/types/app/user";

// Define UserResponse as BaseResponse<User> locally if not exported properly or reuse from common if we made a generic aliases
import { BaseResponse } from "@/types/common";
import { User } from "@/types/app/user";

export const userService = {
  getStatus: async () => {
    const response =
      await axiosInstance.get<UserStatusResponse>("/app/user/status");
    return response.data;
  },

  firstTimeSetup: async (data: FirstTimeSetupDTO) => {
    const response = await axiosInstance.post<AuthResponse>(
      "/app/user/first-time-setup",
      data,
    );
    return response.data;
  },

  login: async (data: LoginDTO) => {
    const response = await axiosInstance.post<AuthResponse>(
      "/app/user/login",
      data,
    );
    return response.data;
  },

  // Protected routes
  create: async (data: CreateUserDTO) => {
    const response = await axiosInstance.post<BaseResponse<User>>(
      "/app/user",
      data,
    );
    return response.data;
  },

  whoami: async () => {
    const response =
      await axiosInstance.get<WhoAmIResponse>("/app/user/whoami");
    return response.data;
  },
};
