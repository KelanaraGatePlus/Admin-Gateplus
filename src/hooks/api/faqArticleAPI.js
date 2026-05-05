import backendUrl from "@/const/backendUrl";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const faqArticleAPI = createApi({
    reducerPath: "faqArticleAPI",
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
    tagTypes: ["faqArticle"],
    endpoints: (builder) => ({
        getFaqArticles: builder.query({
            query: () => ({
                url: "/faqArticles?list=true",
                method: "GET",
            }),
            providesTags: ["faqArticle"],
        }),
        getFaqArticleById: builder.query({
            query: (id) => ({
                url: `/faqArticles/${id}`,
                method: "GET",
            }),
            providesTags: ["faqArticle"],
        }),
        postFaqArticle: builder.mutation({
            query: (formData) => ({
                url: "/faqArticles",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["faqArticle"],
        }),
        updateFaqArticle: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/faqArticles/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["faqArticle"],
        }),
        deleteFaqArticle: builder.mutation({
            query: (id) => ({
                url: `/faqArticles/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["faqArticle"],
        }),
    }),
});

export const {
    useGetFaqArticlesQuery,
    useGetFaqArticleByIdQuery,
    usePostFaqArticleMutation,
    useUpdateFaqArticleMutation,
    useDeleteFaqArticleMutation,
} = faqArticleAPI;