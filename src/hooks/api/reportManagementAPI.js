import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const reportManagementAPI = createApi({
    reducerPath: "reportManagementAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: `${baseUrl}/api/report-management`,
        prepareHeaders: (headers) => {
            // Coba ambil token dari localStorage
            let token = null;
            
            if (typeof window !== 'undefined') {
                token = localStorage.getItem("token");
                
                // Jika tidak ada, coba dari sessionStorage
                if (!token) {
                    token = sessionStorage.getItem("token");
                }
                
                // Jika tidak ada, coba dari cookie
                if (!token) {
                    const cookies = document.cookie.split(';');
                    const tokenCookie = cookies.find(c => c.trim().startsWith('token='));
                    if (tokenCookie) {
                        token = tokenCookie.split('=')[1];
                    }
                }
            }
            
            if (token) {
                // Hapus "Bearer " jika sudah ada di token
                const cleanToken = token.replace('Bearer ', '');
                headers.set("Authorization", `Bearer ${cleanToken}`);
            }
            
            return headers;
        },
    }),
    tagTypes: ["Reports", "ReportDetail", "Stats"],
    endpoints: (builder) => ({
        // Get all reports dengan filter & pagination
        getReports: builder.query({
            query: ({ status = "all", page = 1, limit = 10 }) => ({
                url: `/`,
                params: { status, page, limit },
            }),
            providesTags: ["Reports"],
        }),

        // Get report detail
        getReportDetail: builder.query({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: "ReportDetail", id }],
        }),

        // Get statistics
        getReportStats: builder.query({
            query: () => "/stats",
            providesTags: ["Stats"],
        }),

        // Start reviewing report
        startReviewReport: builder.mutation({
            query: (id) => ({
                url: `/${id}/review`,
                method: "PUT",
            }),
            invalidatesTags: ["Reports", "Stats"],
        }),

        // Take action on report
        takeReportAction: builder.mutation({
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
            invalidatesTags: ["Reports", "ReportDetail", "Stats"],
        }),
    }),
});

export const {
    useGetReportsQuery,
    useGetReportDetailQuery,
    useGetReportStatsQuery,
    useStartReviewReportMutation,
    useTakeReportActionMutation,
} = reportManagementAPI;