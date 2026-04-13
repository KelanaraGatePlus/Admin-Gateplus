import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import backendUrl from "@/const/backendUrl";

export const giftCardAPI = createApi({
  reducerPath: "giftCardAPI",
  refetchOnFocus: true,
  refetchOnReconnect: true,
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendUrl}/gift-card`,
    credentials: "include",
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ["GiftCard", "GiftCardList"],

  endpoints: (builder) => ({
    getGiftCardByContentId: builder.query({
      query: (contentId) => `/content/${contentId}`,
      providesTags: ["GiftCard"],
    }),

    patchGiftCard: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["GiftCard", "GiftCardList"],
    }),

    createGiftCard: builder.mutation({
      query: (formData) => ({
        url: "/",
        method: "POST",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["GiftCard", "GiftCardList"],
    }),

    getAllGiftCards: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) =>
        `/?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
      providesTags: ["GiftCardList"],
    }),

    removeGiftCard: builder.mutation({
      query: (contentId) => ({
        url: `/content/${contentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["GiftCardList"],
    }),
  }),
});

export const {
  useGetGiftCardByContentIdQuery,
  usePatchGiftCardMutation,
  useCreateGiftCardMutation,
  useGetAllGiftCardsQuery,
  useRemoveGiftCardMutation,
} = giftCardAPI;
