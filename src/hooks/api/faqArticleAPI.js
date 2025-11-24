import backendUrl from "@/const/backendUrl";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { get } from "react-hook-form";

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
        postFaqArticle: builder.mutation({
            query: (formData) => ({
                url: "/faqArticles",
                method: "POST",
                body: formData,
                formData: true,
            }),
            invalidatesTags: ["faqArticle"],
        }),
        getFaqArticles: builder.query({
            query: () => ({
                url: "/faqArticles?list=true",
                method: "GET",
            }),
            providesTags: ["faqArticle"],
        }),
    }),
});

export const {
    usePostFaqArticleMutation,
    useGetFaqArticlesQuery
} = faqArticleAPI;