import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import backendUrl from "@/const/backendUrl";

export const financialAPI = createApi({
  reducerPath: "financialAPI",
  refetchOnFocus: true,
  refetchOnReconnect: true,
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendUrl}/management/financial`,
    credentials: "include",
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Financial",
    "Expenses",
    "Payout",
    "Profitability",
    "BankAccounts",
    "VerifiedBankAccounts",
    "Withdrawals",
    "FinancialSettings",
    "SubscriptionTiers",
    "SettingsAuditLog",
  ],

  endpoints: (builder) => ({

    // ── General Finance ────────────────────────────────────────────────
    getGeneralFinance: builder.query({
      query: ({ month, year, allTime } = {}) => {
        const p = new URLSearchParams();
        if (allTime) { p.set("allTime", "true"); }
        else {
          if (month) p.set("month", String(month));
          if (year)  p.set("year",  String(year));
        }
        const qs = p.toString();
        return qs ? `/general-finance?${qs}` : "/general-finance";
      },
      providesTags: ["Profitability"],
      keepUnusedDataFor: 60,
    }),

    // ── Profitability ──────────────────────────────────────────────────
    getProfitabilityAnalytics: builder.query({
      query: ({ month, year, allTime } = {}) => {
        const p = new URLSearchParams();
        if (allTime) { p.set("allTime", "true"); }
        else {
          if (month) p.set("month", String(month));
          if (year)  p.set("year",  String(year));
        }
        const qs = p.toString();
        return qs ? `/profitability?${qs}` : "/profitability";
      },
      providesTags: ["Profitability"],
      keepUnusedDataFor: 60,
    }),

    // ── Revenue Management ─────────────────────────────────────────────
    getRevenueManagement: builder.query({
      query: ({ month, year, allTime } = {}) => {
        const p = new URLSearchParams();
        if (allTime) { p.set("allTime", "true"); }
        else {
          if (month) p.set("month", String(month));
          if (year)  p.set("year",  String(year));
        }
        const qs = p.toString();
        return qs ? `/revenue?${qs}` : "/revenue";
      },
      providesTags: ["Financial"],
      keepUnusedDataFor: 60,
    }),

    // ── Financial Overview ─────────────────────────────────────────────
    getFinancialOverview: builder.query({
      query: () => "/overview",
      providesTags: ["Financial"],
      keepUnusedDataFor: 60,
    }),

    // ── Expenses ───────────────────────────────────────────────────────
    getExpenses: builder.query({
      query: ({ page = 1, limit = 20, search = "", status = "", category = "" } = {}) => {
        const p = new URLSearchParams();
        p.set("page",  String(page));
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

    // ── Creator Payout ─────────────────────────────────────────────────
    getCreatorPayoutControl: builder.query({
      query: ({
        page = 1, limit = 20, search = "", status = "",
        allTime = false, month, year,
      } = {}) => {
        const p = new URLSearchParams();
        p.set("page",  String(page));
        p.set("limit", String(limit));
        if (search) p.set("search", search);
        if (status) p.set("status", status);
        if (allTime) { p.set("allTime", "true"); }
        else {
          if (month) p.set("month", String(month));
          if (year)  p.set("year",  String(year));
        }
        return `/creator-payout?${p.toString()}`;
      },
      providesTags: ["Payout"],
      keepUnusedDataFor: 30,
    }),
    processBulkPayout: builder.mutation({
      query: (body) => ({ url: "/bulk-payout", method: "POST", body }),
      invalidatesTags: ["Payout", "Withdrawals", "Financial", "Profitability"],
    }),

    // ── Withdrawals ────────────────────────────────────────────────────
    getWithdrawals: builder.query({
      query: ({ page = 1, limit = 20, search = "", status = "" } = {}) => {
        const p = new URLSearchParams();
        p.set("page",  String(page));
        p.set("limit", String(limit));
        if (search) p.set("search", search);
        if (status) p.set("status", status);
        return `/withdrawals?${p.toString()}`;
      },
      providesTags: ["Withdrawals"],
      keepUnusedDataFor: 30,
    }),
    approveWithdrawal: builder.mutation({
      query: ({ id, midtransRef }) => ({
        url: `/withdrawals/${id}/approve`, method: "PATCH", body: { midtransRef },
      }),
      invalidatesTags: ["Withdrawals", "Payout", "Financial", "Profitability"],
    }),
    rejectWithdrawal: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/withdrawals/${id}/reject`, method: "PATCH", body: { reason },
      }),
      invalidatesTags: ["Withdrawals", "Payout", "Financial", "Profitability"],
    }),

    // ── Bank Account Approval ──────────────────────────────────────────
    getPendingBankAccounts: builder.query({
      query: ({ page = 1, limit = 20, search = "" } = {}) => {
        const p = new URLSearchParams();
        p.set("page",  String(page));
        p.set("limit", String(limit));
        if (search) p.set("search", search);
        return `/bank-accounts/pending?${p.toString()}`;
      },
      providesTags: ["BankAccounts"],
      keepUnusedDataFor: 30,
    }),
    getVerifiedBankAccounts: builder.query({
      query: ({ page = 1, limit = 15, search = "", bankName = "" } = {}) => {
        const p = new URLSearchParams();
        p.set("page",  String(page));
        p.set("limit", String(limit));
        if (search)   p.set("search",   search);
        if (bankName) p.set("bankName", bankName);
        return `/bank-accounts/verified?${p.toString()}`;
      },
      providesTags: (result, error, arg) => [
        { type: "VerifiedBankAccounts", id: `${arg.page}-${arg.search ?? ""}-${arg.bankName ?? ""}` },
      ],
      keepUnusedDataFor: 60,
    }),
    approveBankAccount: builder.mutation({
      query: (id) => ({ url: `/bank-accounts/${id}/approve`, method: "PATCH" }),
      invalidatesTags: ["BankAccounts", "VerifiedBankAccounts", "Payout"],
    }),
    rejectBankAccount: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/bank-accounts/${id}/reject`, method: "PATCH", body: { reason },
      }),
      invalidatesTags: ["BankAccounts", "Payout"],
    }),

    // ── Financial Settings ─────────────────────────────────────────────
    getFinancialSettings: builder.query({
      query: () => "/settings",
      providesTags: ["FinancialSettings"],
      keepUnusedDataFor: 300, // 5 menit — settings jarang berubah
    }),
    updateFinancialSettings: builder.mutation({
      query: (body) => ({ url: "/settings", method: "PATCH", body }),
      invalidatesTags: ["FinancialSettings", "SettingsAuditLog"],
    }),

    // ── Settings Audit Log ─────────────────────────────────────────────
    getSettingsAuditLog: builder.query({
      query: ({ key, page = 1, limit = 20 } = {}) => {
        const p = new URLSearchParams();
        p.set("page",  String(page));
        p.set("limit", String(limit));
        if (key) p.set("key", key);
        return `/settings/audit-log?${p.toString()}`;
      },
      providesTags: ["SettingsAuditLog"],
      keepUnusedDataFor: 60,
    }),

    // ── Subscription Tiers ─────────────────────────────────────────────
    getSubscriptionTiers: builder.query({
      query: () => "/subscription-tiers",
      providesTags: ["SubscriptionTiers"],
      keepUnusedDataFor: 300, // 5 menit — tiers jarang berubah
    }),
    createSubscriptionTier: builder.mutation({
      query: (body) => ({ url: "/subscription-tiers", method: "POST", body }),
      invalidatesTags: ["SubscriptionTiers", "SettingsAuditLog"],
    }),
    updateSubscriptionTier: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/subscription-tiers/${id}`, method: "PATCH", body,
      }),
      invalidatesTags: ["SubscriptionTiers", "SettingsAuditLog"],
    }),
    deleteSubscriptionTier: builder.mutation({
      query: (id) => ({ url: `/subscription-tiers/${id}`, method: "DELETE" }),
      invalidatesTags: ["SubscriptionTiers", "SettingsAuditLog"],
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
  useProcessBulkPayoutMutation,
  useGetWithdrawalsQuery,
  useApproveWithdrawalMutation,
  useRejectWithdrawalMutation,
  useGetPendingBankAccountsQuery,
  useGetVerifiedBankAccountsQuery,
  useApproveBankAccountMutation,
  useRejectBankAccountMutation,
  useGetFinancialSettingsQuery,
  useUpdateFinancialSettingsMutation,
  useGetSettingsAuditLogQuery,
  useGetSubscriptionTiersQuery,
  useCreateSubscriptionTierMutation,
  useUpdateSubscriptionTierMutation,
  useDeleteSubscriptionTierMutation,
} = financialAPI;