import backendUrl from "@/const/backendUrl";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const faqSubcategoryAPI = createApi({
    reducerPath: "faqSubcategoryAPI",
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
    tagTypes: ["faqSubcategory"],
    endpoints: (builder) => ({
        getFaqArticleSubcategories: builder.query({
            query: ({
                category
            }) => ({
                url: `faqSubcategories?category=${category}`,
                method: "GET",
            }),
            providesTags: ["faqSubcategory"],
        }),
        getFaqArticleCategories: builder.query({
            query: () => `faqSubcategories/categories`,
            providesTags: ["faqSubcategory"],
        }),
    }),
});

export const {
    useGetFaqArticleSubcategoriesQuery,
    useGetFaqArticleCategoriesQuery,
} = faqSubcategoryAPI;