import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import backendUrl from "@/const/backendUrl";

export const genreAPI = createApi({
    reducerPath: "genreAPI",
    refetchOnFocus: true,
    refetchOnReconnect: true,
    baseQuery: fetchBaseQuery({
        baseUrl: `${backendUrl}/category`,
        credentials: "include",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["Genres"],
    endpoints: (builder) => ({
        createGenres: builder.mutation({
            query: (formData) => ({
                url: "/",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["Genres"],
        }),
        updateGenres: builder.mutation({
            query: ({ id, formData }) => ({  
                url: `/${id}`,
                method: "PATCH",
                body: formData,
            }),
            invalidatesTags: ["Genres"],
        }),
    })
});

export const { useCreateGenresMutation, useUpdateGenresMutation } = genreAPI;
