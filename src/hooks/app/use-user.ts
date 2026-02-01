"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/app/user.service";
import { queryKeys, invalidationMap } from "@/constants/query-keys";
import {
  CreateUserDTO,
  ResetPasswordDTO,
  EditProfileDTO,
  ChangePasswordDTO,
} from "@/types/app/user";
import { FilterQuery } from "@/types/common";

// --- User Hooks ---

export function useUsers(params?: FilterQuery) {
  return useQuery({
    queryKey: [...queryKeys.app.user.all, "list", params], // Ensure query key consistency
    queryFn: () => userService.list(params),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDTO) => userService.create(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.app.user.all });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.app.user.all });
    },
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ResetPasswordDTO }) =>
      userService.resetPassword(id, data),
  });
}

export function useProfile() {
  return useQuery({
    queryKey: [...queryKeys.app.user.all, "profile"],
    queryFn: () => userService.me(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditProfileDTO) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.app.user.all, "profile"],
      });
      // Also invalidate auth user query if it's separate, but usually auth uses profile
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordDTO) => userService.changePassword(data),
  });
}
