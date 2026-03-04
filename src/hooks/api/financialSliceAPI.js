// C:\Users\ALIEF MUZAKHI\Project_Kelanara\Admin-Gateplus\src\hooks\api\financialSliceAPI.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export const financialAPI = createApi({
  reducerPath: "financialAPI",
  refetchOnFocus: true,
  refetchOnReconnect: true,
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}/management/financial`,
    credentials: "include",
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Financial", "Expenses", "Payout", "Profitability", "BankAccounts"],

  endpoints: (builder) => ({
    // ── General Finance ──────────────────────────────────────────────────
    getGeneralFinance: builder.query({
      query: ({ month, year } = {}) => {
        const p = new URLSearchParams();
        if (month) p.set("month", String(month));
        if (year)  p.set("year",  String(year));
        const qs = p.toString();
        return qs ? `/general-finance?${qs}` : "/general-finance";
      },
      providesTags: ["Profitability"],
      keepUnusedDataFor: 60,
    }),

    // ── Profitability Analytics ───────────────────────────────────────────
    getProfitabilityAnalytics: builder.query({
      query: ({ month, year, allTime } = {}) => {
        const p = new URLSearchParams();
        if (allTime) {
          p.set("allTime", "true");
        } else {
          if (month) p.set("month", String(month));
          if (year)  p.set("year",  String(year));
        }
        const qs = p.toString();
        return qs ? `/profitability?${qs}` : "/profitability";
      },
      providesTags: ["Profitability"],
      keepUnusedDataFor: 60,
    }),

    // ── Revenue Management ────────────────────────────────────────────────
    getRevenueManagement: builder.query({
      query: ({ month, year, allTime } = {}) => {
        const p = new URLSearchParams();
        if (allTime) {
          p.set("allTime", "true");
        } else {
          if (month) p.set("month", String(month));
          if (year)  p.set("year",  String(year));
        }
        const qs = p.toString();
        return qs ? `/revenue?${qs}` : "/revenue";
      },
      providesTags: ["Financial"],
      keepUnusedDataFor: 60,
    }),

    // ── Financial Overview ────────────────────────────────────────────────
    getFinancialOverview: builder.query({
      query: () => "/overview",
      providesTags: ["Financial"],
      keepUnusedDataFor: 60,
    }),

    // ── Expenses ──────────────────────────────────────────────────────────
    getExpenses: builder.query({
      query: ({ page = 1, limit = 20, search = "", status = "", category = "" } = {}) => {
        const p = new URLSearchParams();
        p.set("page", String(page));
        p.set("limit", String(limit));
        if (search)   p.set("search",   search);
        if (status)   p.set("status",   status);
        if (category) p.set("category", category);
        return `/expenses?${p.toString()}`;
      },
      providesTags: ["Expenses"],
      keepUnusedDataFor: 30,
    }),

    createExpense: builder.mutation({
      query: (body) => ({ url: "/expenses", method: "POST", body }),
      invalidatesTags: ["Expenses", "Financial", "Profitability"],
    }),

    updateExpense: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/expenses/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Expenses", "Financial", "Profitability"],
    }),

    deleteExpense: builder.mutation({
      query: (id) => ({ url: `/expenses/${id}`, method: "DELETE" }),
      invalidatesTags: ["Expenses", "Financial", "Profitability"],
    }),

    // ── Creator Payout (updated: supports allTime + month/year) ──────────
    getCreatorPayoutControl: builder.query({
      query: ({ page = 1, limit = 20, search = "", status = "", allTime = false, month, year } = {}) => {
        const p = new URLSearchParams();
        p.set("page", String(page));
        p.set("limit", String(limit));
        if (search) p.set("search", search);
        if (status) p.set("status", status);
        if (allTime) {
          p.set("allTime", "true");
        } else {
          if (month) p.set("month", String(month));
          if (year)  p.set("year",  String(year));
        }
        return `/creator-payout?${p.toString()}`;
      },
      providesTags: ["Payout"],
      keepUnusedDataFor: 30,
    }),

    // ── Bank Account Approval ─────────────────────────────────────────────
    getPendingBankAccounts: builder.query({
      query: ({ page = 1, limit = 20, search = "" } = {}) => {
        const p = new URLSearchParams();
        p.set("page", String(page));
        p.set("limit", String(limit));
        if (search) p.set("search", search);
        return `/bank-accounts/pending?${p.toString()}`;
      },
      providesTags: ["BankAccounts"],
      keepUnusedDataFor: 30,
    }),

    approveBankAccount: builder.mutation({
      query: (id) => ({ url: `/bank-accounts/${id}/approve`, method: "PATCH" }),
      invalidatesTags: ["BankAccounts", "Payout"],
    }),

    rejectBankAccount: builder.mutation({
      query: ({ id, reason }) => ({
        url:    `/bank-accounts/${id}/reject`,
        method: "PATCH",
        body:   { reason },
      }),
      invalidatesTags: ["BankAccounts", "Payout"],
    }),
  }),
});

export const {
  useGetGeneralFinanceQuery,
  useGetProfitabilityAnalyticsQuery,
  useGetFinancialOverviewQuery,
  useGetRevenueManagementQuery,
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetCreatorPayoutControlQuery,
  useGetPendingBankAccountsQuery,
  useApproveBankAccountMutation,
  useRejectBankAccountMutation,
} = financialAPI;