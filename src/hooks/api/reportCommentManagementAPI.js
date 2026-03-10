import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import backendUrl from "@/const/backendUrl";
const baseUrl = backendUrl;

export const reportCommentManagementAPI = createApi({
    reducerPath: "reportCommentManagementAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: `${baseUrl}/api/report-comment-management`,
        prepareHeaders: (headers) => {
            if (typeof window !== 'undefined') {
                let token = localStorage.getItem("token");
                if (!token) {
                    token = sessionStorage.getItem("token");
                }
                if (!token) {
                    const cookies = document.cookie.split(';');
                    const tokenCookie = cookies.find(c => c.trim().startsWith('token='));
                    if (tokenCookie) {
                        token = tokenCookie.split('=')[1];
                    }
                }
                if (token) {
                    const cleanToken = token.replace('Bearer ', '');
                    headers.set("Authorization", `Bearer ${cleanToken}`);
                }
            }
            return headers;
        },
    }),
    tagTypes: ["CommentReports", "CommentReportDetail", "CommentStats"],
    endpoints: (builder) => ({
        getCommentReports: builder.query({
            query: ({ status = "all", page = 1, limit = 10 }) => ({
                url: `/`,
                params: { status, page, limit },
            }),
            providesTags: ["CommentReports"],
        }),

        getCommentReportDetail: builder.query({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: "CommentReportDetail", id }],
        }),

        getCommentReportStats: builder.query({
            query: () => "/stats",
            providesTags: ["CommentStats"],
        }),

        startReviewCommentReport: builder.mutation({
            query: (id) => ({
                url: `/${id}/review`,
                method: "PUT",
            }),
            invalidatesTags: ["CommentReports", "CommentStats"],
        }),

        takeCommentReportAction: builder.mutation({
            query: ({ id, actionTaken, suspendDuration, verdict, adminNotes }) => ({
                url: `/${id}/action`,
                method: "POST",
                body: {
                    actionTaken,
                    suspendDuration,
                    verdict,
                    adminNotes,
                },
            }),
            invalidatesTags: ["CommentReports", "CommentReportDetail", "CommentStats"],
        }),
    }),
});

export const {
    useGetCommentReportsQuery,
    useGetCommentReportDetailQuery,
    useGetCommentReportStatsQuery,
    useStartReviewCommentReportMutation,
    useTakeCommentReportActionMutation,
} = reportCommentManagementAPI;