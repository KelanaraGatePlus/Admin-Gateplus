import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import backendUrl from "@/const/backendUrl";

export const contentManagementAPI = createApi({
    reducerPath: "contentManagementAPI",
    refetchOnFocus: true,
    refetchOnReconnect: true,
    baseQuery: fetchBaseQuery({
        baseUrl: `${backendUrl}/management`,
        credentials: "include",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["Creators", "Content", "Genres", "Overview"],

    endpoints: (builder) => ({
        getOverviewStats: builder.query({
            query: () => "/overview/stats",
            providesTags: ["Overview"],
            keepUnusedDataFor: 60,
        }),
        getRevenueChart: builder.query({
            query: () => "/overview/revenue-chart",
            providesTags: ["Overview"],
            keepUnusedDataFor: 120,
        }),
        getCreatorGrowthChart: builder.query({
            query: () => "/overview/creator-growth-chart",
            providesTags: ["Overview"],
            keepUnusedDataFor: 120,
        }),
        getRecentActivity: builder.query({
            query: () => "/overview/recent-activity",
            providesTags: ["Overview"],
            keepUnusedDataFor: 30,
        }),

        getCreatorStats: builder.query({
            query: () => "/creators/stats",
            providesTags: ["Creators"],
            keepUnusedDataFor: 30,
        }),

        getCreators: builder.query({
            query: ({
                page = 1, limit = 10, search = "",
                statuses = [], risks = [],
                joinPreset = "", joinFrom = "", joinTo = "",
                minRevenue = "", maxRevenue = "",
                minContent = "", maxContent = "",
                minReports = "", maxReports = "",
                sortBy = "joinDate", sortDir = "desc",
            } = {}) => {
                const p = new URLSearchParams();
                p.set("page", String(page));
                p.set("limit", String(limit));
                if (search) p.set("search", search);
                if (joinPreset) p.set("joinPreset", joinPreset);
                if (joinFrom) p.set("joinFrom", joinFrom);
                if (joinTo) p.set("joinTo", joinTo);
                if (minRevenue) p.set("minRevenue", minRevenue);
                if (maxRevenue) p.set("maxRevenue", maxRevenue);
                if (minContent) p.set("minContent", minContent);
                if (maxContent) p.set("maxContent", maxContent);
                if (minReports) p.set("minReports", minReports);
                if (maxReports) p.set("maxReports", maxReports);
                p.set("sortBy", sortBy);
                p.set("sortDir", sortDir);
                statuses.forEach((s) => p.append("status", s));
                risks.forEach((r) => p.append("risk", r));
                return `/creators?${p.toString()}`;
            },
            providesTags: ["Creators"],
            keepUnusedDataFor: 30,
        }),

        getCreatorDetail: builder.query({
            query: (creatorId) => `/creators/${creatorId}/detail`,
            providesTags: (result, error, creatorId) => [{ type: "Creators", id: creatorId }],
            keepUnusedDataFor: 60,
        }),

        updateCreatorStatus: builder.mutation({
            query: ({ userId, action, suspendDays }) => ({
                url: `/creators/${userId}/status`,
                method: "PATCH",
                body: { action, suspendDays },
            }),
            invalidatesTags: ["Creators", "Overview"],
        }),

        getContentStats: builder.query({
            query: () => "/content/stats",
            providesTags: ["Content"],
            keepUnusedDataFor: 30,
        }),

        // ── getContents: semua filter dikirim ke backend ──
        getContents: builder.query({
            query: ({
                page = 1,
                limit = 10,
                search = "",
                filter = "all",
                types = [],
                statuses = [],
                genres = [],
                datePreset = "",
                dateFrom = "",
                dateTo = "",
                creator = "",
                minReports = "",
                maxReports = "",
                minQuality = "",
                maxQuality = "",
                minViews = "",
                maxViews = "",
                sortBy = "uploadDate",
                sortDir = "desc",
            } = {}) => {
                const p = new URLSearchParams();
                p.set("page",    String(page));
                p.set("limit",   String(limit));
                p.set("filter",  filter);
                p.set("sortBy",  sortBy);
                p.set("sortDir", sortDir);
                if (search)     p.set("search",     search);
                if (datePreset) p.set("datePreset", datePreset);
                if (dateFrom)   p.set("dateFrom",   dateFrom);
                if (dateTo)     p.set("dateTo",     dateTo);
                if (creator)    p.set("creator",    creator);
                if (minReports) p.set("minReports", minReports);
                if (maxReports) p.set("maxReports", maxReports);
                if (minQuality) p.set("minQuality", minQuality);
                if (maxQuality) p.set("maxQuality", maxQuality);
                if (minViews)   p.set("minViews",   minViews);
                if (maxViews)   p.set("maxViews",   maxViews);
                types.forEach((t)    => p.append("types",    t));
                statuses.forEach((s) => p.append("statuses", s));
                genres.forEach((g)   => p.append("genres",   g));
                return `/content?${p.toString()}`;
            },
            providesTags: ["Content"],
            keepUnusedDataFor: 30,
        }),

        getGenreStats: builder.query({
            query: () => "/genres/stats",
            providesTags: ["Genres"],
            keepUnusedDataFor: 60,
        }),
        getGenres: builder.query({
            query: ({ page = 1, limit = 10, search = "", statusFilter = "all" } = {}) => ({
                url: "/genres",
                params: { page, limit, search, statusFilter },
            }),
            providesTags: ["Genres"],
            keepUnusedDataFor: 30,
        }),
        getActiveGenres: builder.query({
            query: () => "/genres/active-only",
            providesTags: ["Genres"],
            keepUnusedDataFor: 60,
        }),
        createGenres: builder.mutation({
            query: ({ names }) => ({ url: "/genres", method: "POST", body: { names } }),
            invalidatesTags: ["Genres"],
        }),
        updateGenre: builder.mutation({
            query: ({ id, name, isActive }) => ({ url: `/genres/${id}`, method: "PATCH", body: { name, isActive } }),
            invalidatesTags: ["Genres"],
        }),
        deleteGenre: builder.mutation({
            query: (id) => ({ url: `/genres/${id}`, method: "DELETE" }),
            invalidatesTags: ["Genres"],
        }),
    }),
});

export const {
    useGetOverviewStatsQuery,
    useGetRevenueChartQuery,
    useGetCreatorGrowthChartQuery,
    useGetRecentActivityQuery,
    useGetCreatorStatsQuery,
    useGetCreatorsQuery,
    useGetCreatorDetailQuery,
    useUpdateCreatorStatusMutation,
    useGetContentStatsQuery,
    useGetContentsQuery,
    useGetGenreStatsQuery,
    useGetGenresQuery,
    useGetActiveGenresQuery,
    useCreateGenresMutation,
    useUpdateGenreMutation,
    useDeleteGenreMutation,
} = contentManagementAPI;