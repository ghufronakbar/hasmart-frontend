import { axiosInstance } from "@/lib/axios";
import { FilterQuery } from "@/types/common";
import {
  CreateUserDTO,
  EditProfileDTO,
  ChangePasswordDTO,
  ResetPasswordDTO,
  UserListResponse,
  UserResponse,
  LoginDTO,
  LoginResponse,
} from "@/types/app/user";

export const userService = {
  login: async (data: LoginDTO) => {
    const response = await axiosInstance.post<LoginResponse>(
      "/app/user/login",
      data,
    );
    return response.data;
  },
  list: async (params?: FilterQuery) => {
    const response = await axiosInstance.get<UserListResponse>("/app/user", {
      params,
    });
    return response.data;
  },

  create: async (data: CreateUserDTO) => {
    const response = await axiosInstance.post<UserResponse>("/app/user", data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete<UserResponse>(
      `/app/user/${id}`,
    );
    return response.data;
  },

  resetPassword: async (id: number, data: ResetPasswordDTO) => {
    const response = await axiosInstance.post<UserResponse>(
      `/app/user/${id}/reset-password`,
      data,
    );
    return response.data;
  },

  me: async () => {
    const response = await axiosInstance.get<UserResponse>("/app/user/whoami");
    return response.data;
  },

  updateProfile: async (data: EditProfileDTO) => {
    const response = await axiosInstance.put<UserResponse>("/app/user", data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordDTO) => {
    const response = await axiosInstance.post<UserResponse>(
      "/app/user/change-password",
      data,
    );
    return response.data;
  },
};
