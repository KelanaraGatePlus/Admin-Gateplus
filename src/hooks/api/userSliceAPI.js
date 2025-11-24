import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import backendUrl from "@/const/backendUrl";

export const userAPI = createApi({
  reducerPath: "usersAPI",
  refetchOnFocus: true,
  refetchOnReconnect: true,
  baseQuery: fetchBaseQuery({
    baseUrl: backendUrl,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["usersAPI"],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/users",
      providesTags: ["usersAPI"],
      keepUnusedDataFor: 5,
    }),
    getUserDetail: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: ["usersAPI"],
      keepUnusedDataFor: 60,
    }),
    getUserSavedContent: builder.query({
      query: () => `/save/user`,
      providesTags: ["usersAPI"],
      keepUnusedDataFor: 60,
    }),
    getUserLastWatchedContent: builder.query({
      query: () => `/save/user/last-watch`,
      providesTags: ["usersAPI"],
      keepUnusedDataFor: 60,
    }),
    getUserPurchasedContent: builder.query({
      query: () => `/save/user/purchased`,
      providesTags: ["usersAPI"],
      keepUnusedDataFor: 60,
    }),
    getMe: builder.query({
      query: () => "/users/authMe",
      providesTags: ["usersAPI"],
    }),
    registerUser: builder.mutation({
      query: (newUser) => ({
        url: "users/register",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["usersAPI"],
    }),
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "users/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["usersAPI"],
    }),
    checkUserAvailability: builder.query({
      query: ({ type, value }) => `/users/check?type=${type}&value=${value}`,
      keepUnusedDataFor: 0,
    }),
    updateUser: builder.mutation({
      query: (formData) => ({
        url: "users",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["usersAPI"],
    }),
    resetPasswordRequest: builder.mutation({
      query: ({ email }) => ({
        url: "users/requestResetPassword",
        method: "POST",
        body: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ resetPasswordToken, newPassword }) => ({
        url: "users/resetPassword",
        method: "POST",
        body: {
          resetPasswordToken,
          newPassword
        },
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserDetailQuery,
  useGetUserSavedContentQuery,
  useGetMeQuery,
  useRegisterUserMutation,
  useLoginUserMutation,
  useCheckUserAvailabilityQuery,
  useGetUserLastWatchedContentQuery,
  useUpdateUserMutation,
  useGetUserPurchasedContentQuery,
  useResetPasswordRequestMutation,
  useResetPasswordMutation,
} = userAPI;
