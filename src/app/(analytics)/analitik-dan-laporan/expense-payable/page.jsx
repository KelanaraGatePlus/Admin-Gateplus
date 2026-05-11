"use client";

import React, { useState, useRef, useEffect } from "react";
import backendUrl from "@/const/backendUrl";
import { useGetExpensesQuery, useCreateExpenseMutation, useUpdateExpenseMutation } from "@/hooks/api/financialSliceAPI";
import Icon from "@/lib/IconClient";
import { cn } from "@/lib/utils";
import { downloadWithAuth } from "@/lib/downloadWithAuth";

function fmtRp(val = 0) {
  if (Math.abs(val) >= 1_000_000_000) return `Rp${(val / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(val) >= 1_000_000) return `Rp${(val / 1_000_000).toFixed(1)}M`;
  if (Math.abs(val) >= 1_000) return `Rp${(val / 1_000).toFixed(0)}K`;
  return `Rp${val.toLocaleString("id-ID")}`;
}

const STATUS_STYLE = {
  PAID:      { label: "Paid",      cls: "bg-emerald-100 text-emerald-700 border border-emerald-200", icon: "solar:check-circle-bold" },
  PENDING:   { label: "Pending",   cls: "bg-amber-100 text-amber-700 border border-amber-200",       icon: "solar:clock-circle-bold" },
  OVERDUE:   { label: "Overdue",   cls: "bg-red-100 text-red-700 border border-red-200",             icon: "solar:danger-triangle-bold" },
  CANCELLED: { label: "Cancelled", cls: "bg-gray-100 text-gray-500 border border-gray-200",          icon: "solar:close-circle-bold" },
};

const APPROVAL_STYLE = {
  APPROVED: { label: "Approved", cls: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
  PENDING:  { label: "Pending",  cls: "bg-amber-100 text-amber-700 border border-amber-200" },
  REJECTED: { label: "Rejected", cls: "bg-red-100 text-red-700 border border-red-200" },
};

const CATEGORY_LABELS = {
  CREATOR_PAYOUT:      "Creator Payout",
  REFUND:              "Refund",
  PAYMENT_GATEWAY_FEE: "Payment Gateway Fee",
  INFRASTRUCTURE_COST: "Infrastructure Cost",
  SERVER:              "Server",
  MARKETING:           "Marketing",
  OPERATIONAL:         "Operational",
  STAFF_SALARY:        "Staff Salary",
  OTHER:               "Other",
};

// Sentinel value untuk "All Time"
const ALL_TIME_VALUE = "all-time";

// Single source of truth: status is always computed from approvalStatus + dueDate
function deriveStatus(approvalStatus, dueDate) {
  if (approvalStatus === "APPROVED") return "PAID";
  if (approvalStatus === "REJECTED") return "CANCELLED";
  if (dueDate && new Date(dueDate) < new Date()) return "OVERDUE";
  return "PENDING";
}

function toDateInput(val) {
  if (!val) return "";
  try { return new Date(val).toISOString().split("T")[0]; } catch { return ""; }
}

function buildFormFromData(data) {
  return {
    date:           toDateInput(data?.date),
    category:       data?.category       || "",
    vendor:         data?.vendor         || "",
    amount:         data?.amount         ?? 0,
    dueDate:        toDateInput(data?.dueDate),
    description:    data?.description    || "",
    approvalStatus: data?.approvalStatus || "PENDING",
    attachmentName: data?.attachmentName || "",
    attachmentUrl:  data?.attachmentUrl  || "",
  };
}

// ─── Add/Edit Expense Modal ──────────────────────────────────
function ExpenseModal({ open, onClose, editData, onSuccess }) {
  const isEdit = !!editData;
  const [createExpense, { isLoading: creating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: updating }] = useUpdateExpenseMutation();
  const fileRef = useRef();

  const [form,        setForm]        = useState(() => buildFormFromData(editData));
  const [error,       setError]       = useState("");
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (open) { setForm(buildFormFromData(editData)); setError(""); }
  }, [open, editData]);

  if (!open) return null;

  // Derived status — computed live, never stored
  const derivedStatus = deriveStatus(form.approvalStatus, form.dueDate);
  const statusStyle   = STATUS_STYLE[derivedStatus] || STATUS_STYLE.PENDING;

  const handleChange = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const res   = await fetch(
        `${backendUrl}/management/financial/upload-attachment`,
        {
          method:      "POST",
          credentials: "include",
          headers:     token ? { Authorization: `Bearer ${token}` } : {},
          body:        formData,
        }
      );

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Upload failed");

      // Simpan URL publik + nama asli ke form
      setForm((prev) => ({
        ...prev,
        attachmentUrl:  json.url,
        attachmentName: json.name,
      }));
    } catch (err) {
      setUploadError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.date || !form.vendor || !form.category || !form.amount || !form.dueDate || !form.description) {
      setError("Please fill all required fields.");
      return;
    }
    try {
      // Always send derived status to backend
      const payload = { ...form, status: derivedStatus };
      if (isEdit) {
        await updateExpense({ id: editData.id, ...payload }).unwrap();
      } else {
        await createExpense(payload).unwrap();
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.data?.message || "Failed to save expense");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{isEdit ? "Edit Expense" : "Add New Expense"}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEdit ? `Editing ${editData.expenseId}` : "Create a new expense entry"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
            <Icon icon="solar:close-bold" className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">{error}</div>
          )}

          {/* Expense ID + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Expense ID</label>
              <input
                value={isEdit ? editData.expenseId : "Auto-generated"}
                disabled
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1297DC]/30"
              />
            </div>
          </div>

          {/* Category + Vendor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1297DC]/30 bg-white"
              >
                <option value="">Select category</option>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Vendor <span className="text-red-500">*</span>
              </label>
              <input
                value={form.vendor}
                onChange={(e) => handleChange("vendor", e.target.value)}
                placeholder="Enter vendor name"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1297DC]/30"
              />
            </div>
          </div>

          {/* Amount + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Amount (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1297DC]/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1297DC]/30"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter expense description"
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1297DC]/30 resize-none"
            />
          </div>

          {/* Attachment */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Attachment</label>
            <div
              onClick={() => !uploading && fileRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 transition-colors",
                uploading
                  ? "border-blue-200 bg-blue-50/40 cursor-wait"
                  : "border-gray-200 hover:border-[#1297DC]/40 hover:bg-blue-50/30 cursor-pointer"
              )}
            >
              {uploading ? (
                <>
                  <div className="w-7 h-7 border-4 border-[#1297DC] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-[#1297DC]">Uploading...</p>
                </>
              ) : (
                <>
                  <Icon icon="solar:upload-minimalistic-bold" className="w-8 h-8 text-gray-300" />
                  <p className="text-sm text-gray-500">
                    {form.attachmentName || "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-400">PDF, PNG, JPG up to 10MB</p>
                </>
              )}
            </div>
            {/* Tampilkan error upload jika gagal */}
            {uploadError && (
              <p className="text-xs text-red-500 mt-1">{uploadError}</p>
            )}
            {/* Tampilkan nama file yang sudah berhasil diupload */}
            {form.attachmentUrl && !uploading && (
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <Icon icon="solar:check-circle-bold" className="w-3.5 h-3.5" />
                {form.attachmentName} — uploaded
              </p>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Approval Status + Derived Status (read-only) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Approval Status</label>
              <select
                value={form.approvalStatus}
                onChange={(e) => handleChange("approvalStatus", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1297DC]/30 bg-white"
              >
                {Object.entries(APPROVAL_STYLE).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Status <span className="text-gray-400 font-normal">(auto)</span>
              </label>
              <div className="w-full px-3 py-2.5 border border-gray-100 rounded-xl bg-gray-50 flex items-center gap-2">
                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", statusStyle.cls)}>
                  <Icon icon={statusStyle.icon} className="w-3.5 h-3.5" />
                  {statusStyle.label}
                </span>
                {derivedStatus === "OVERDUE" && (
                  <span className="text-xs text-red-400">Past due</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Based on approval &amp; due date</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={creating || updating || uploading}
            className="px-5 py-2.5 text-sm bg-[#1297DC] text-white rounded-xl hover:bg-[#0d7fc0] disabled:opacity-60 flex items-center gap-2"
          >
            {(creating || updating) && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isEdit ? "Update Expense" : "Create Expense"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function ExpensePayablePage() {
  const now = new Date();

  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("");
  const [page,          setPage]          = useState(1);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editData,      setEditData]      = useState(null);

  // ── Period selector — default: bulan ini ──────────────────
  const [selectedValue, setSelectedValue] = useState(
    `${now.getFullYear()}-${now.getMonth() + 1}`
  );

  const isAllTime = selectedValue === ALL_TIME_VALUE;

  const [selectedYear, selectedMonth] = isAllTime
    ? [null, null]
    : selectedValue.split("-").map(Number);

  // Build query args: allTime=true ATAU month + year
  const periodArgs = isAllTime
    ? { allTime: true }
    : { month: selectedMonth, year: selectedYear };

  const { data, isLoading, isError, refetch } = useGetExpensesQuery(
    { page, limit: 20, search, status: statusFilter, ...periodArgs },
    { refetchOnMountOrArgChange: true }
  );

  const d            = data?.data       || {};
  const expenses     = d.expenses       || [];
  const stats        = d.stats          || {};
  const agingReport  = d.agingReport    || [];
  const monthOptions = d.monthOptions   || [];
  const pagination   = data?.pagination || {};

  // Label periode aktif untuk badge
  const activeLabel = isAllTime
    ? "All Time"
    : monthOptions.find((o) => o.month === selectedMonth && o.year === selectedYear)?.label
      || (selectedYear && selectedMonth
          ? new Date(selectedYear, selectedMonth - 1, 1)
              .toLocaleString("en-US", { month: "long", year: "numeric" })
          : "This Month");

  const handleOpenAdd  = ()    => { setEditData(null);  setModalOpen(true); };
  const handleOpenEdit = (exp) => { setEditData(exp);   setModalOpen(true); };

  const handlePeriodChange = (e) => {
    setSelectedValue(e.target.value);
    setPage(1);
  };

  const handleExport = async () => {
    try {
      await downloadWithAuth(
        `${backendUrl}/management/financial/export?type=expense`,
        "expense-report.csv"
      );
    } catch (err) {
      alert(err.message || "Failed to export expenses");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1297DC] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading expense data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96 flex-col gap-3">
        <Icon icon="solar:danger-circle-bold" className="w-12 h-12 text-red-400" />
        <p className="text-gray-600">Failed to load data</p>
        <button onClick={refetch} className="text-sm text-[#1297DC] hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">

      {/* Modals */}
      <ExpenseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editData={editData}
        onSuccess={refetch}
      />

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense & Accounts Payable</h1>
          <p className="text-sm text-gray-500 mt-1">Expense control and payment tracking</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">

          {/* ── Period Selector (All Time + per bulan) ── */}
          <div className="relative">
            <select
              value={selectedValue}
              onChange={handlePeriodChange}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1297DC]/30 cursor-pointer"
            >
              {/* All Time di posisi paling atas */}
              <option value={ALL_TIME_VALUE}>📊 All Time</option>

              {/* Separator */}
              <option disabled className="text-gray-400 text-xs">── Per Month ──</option>

              {/* Per bulan dari backend */}
              {monthOptions.length > 0
                ? monthOptions.map((o) => (
                    <option key={`${o.year}-${o.month}`} value={`${o.year}-${o.month}`}>
                      {o.label}
                    </option>
                  ))
                : (
                  <option value={`${now.getFullYear()}-${now.getMonth() + 1}`}>
                    {now.toLocaleString("en-US", { month: "long", year: "numeric" })}
                  </option>
                )
              }
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
          </div>

          {/* Badge periode aktif */}
          <span className={cn(
            "text-xs px-2.5 py-1.5 rounded-lg font-medium border",
            isAllTime
              ? "bg-blue-50 text-blue-600 border-blue-200"
              : "bg-gray-50 text-gray-500 border-gray-200"
          )}>
            {isAllTime ? "Showing All Time" : activeLabel}
          </span>

          <div className="w-px h-6 bg-gray-200" />

          <div className="relative">
            <Icon icon="solar:magnifer-bold" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search expenses..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1297DC]/30 w-48"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600"
          >
            <option value="">All Status</option>
            {Object.entries(STATUS_STYLE).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            <Icon icon="solar:download-bold" className="w-4 h-4" /> Export
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#1297DC] text-white rounded-lg hover:bg-[#0d7fc0]"
          >
            <Icon icon="solar:add-bold" className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label:    isAllTime ? "Total Expenses (All Time)" : "Total Expenses (MTD)",
            value:    fmtRp(stats.totalMTD),
            color:    "text-gray-900",
            sub:      isAllTime ? "Cumulative all time" : activeLabel,
            subColor: isAllTime ? "text-blue-500" : "text-gray-400",
          },
          {
            label:    "Paid",
            value:    fmtRp(stats.paid),
            color:    "text-emerald-600",
            sub:      isAllTime ? "All time paid" : `Paid in ${activeLabel}`,
            subColor: "text-gray-400",
          },
          {
            label:    "Pending Approval",
            value:    fmtRp(stats.pendingApproval),
            color:    "text-amber-500",
            sub:      isAllTime ? "All time pending" : `Pending in ${activeLabel}`,
            subColor: "text-gray-400",
          },
          {
            label:    "Overdue",
            value:    fmtRp(stats.overdue),
            color:    "text-red-500",
            sub:      isAllTime ? "All time overdue" : `Overdue in ${activeLabel}`,
            subColor: "text-gray-400",
          },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className={cn("text-xs mt-1", s.subColor)}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Expense Ledger Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Expense Ledger</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md">
            {isAllTime ? "All time records" : activeLabel}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Expense ID", "Date", "Vendor", "Category", "Amount", "Status", "Approval", "Due Date", "Attachment", "Actions"].map((h) => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-400 text-sm">
                    <Icon icon="solar:document-bold" className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                    No expenses found for {isAllTime ? "all time" : activeLabel}
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => {
                  // Always derive — never trust stored status field alone
                  const derivedStatus = deriveStatus(exp.approvalStatus, exp.dueDate);
                  const st = STATUS_STYLE[derivedStatus]        || STATUS_STYLE.PENDING;
                  const ap = APPROVAL_STYLE[exp.approvalStatus] || APPROVAL_STYLE.PENDING;
                  const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(exp.attachmentName || "");

                  return (
                    <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-3 font-mono text-xs text-gray-600">{exp.expenseId}</td>
                      <td className="py-3 px-3 text-gray-600 whitespace-nowrap">
                        {new Date(exp.date).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-3 px-3 font-medium text-gray-800">{exp.vendor}</td>
                      <td className="py-3 px-3 text-gray-600">{CATEGORY_LABELS[exp.category] || exp.category}</td>
                      <td className="py-3 px-3 font-semibold text-gray-900 whitespace-nowrap">{fmtRp(exp.amount)}</td>

                      {/* Status — always derived, read-only */}
                      <td className="py-3 px-3">
                        <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap", st.cls)}>
                          <Icon icon={st.icon} className="w-3 h-3" />
                          {st.label}
                        </span>
                      </td>

                      {/* Approval Status */}
                      <td className="py-3 px-3">
                        <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap", ap.cls)}>
                          {ap.label}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-gray-600 whitespace-nowrap">
                        {new Date(exp.dueDate).toLocaleDateString("id-ID")}
                      </td>

                      {/* Attachment — click to download directly */}
                      <td className="py-3 px-3">
                        {exp.attachmentUrl && exp.attachmentName ? (
                          <a
                            href={exp.attachmentUrl}
                            download={exp.attachmentName}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center gap-1.5 max-w-[140px]"
                            title={`Download: ${exp.attachmentName}`}
                          >
                            {isImage ? (
                              <img
                                src={exp.attachmentUrl}
                                alt={exp.attachmentName}
                                className="w-8 h-8 rounded object-cover border border-gray-200 group-hover:ring-2 group-hover:ring-[#1297DC]/40 transition flex-shrink-0"
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                              />
                            ) : (
                              <span className="w-8 h-8 rounded bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition">
                                <Icon icon="solar:download-bold" className="w-4 h-4 text-[#1297DC]" />
                              </span>
                            )}
                            <span className="text-xs text-[#1297DC] group-hover:underline truncate">
                              {exp.attachmentName}
                            </span>
                          </a>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 whitespace-nowrap"
                        >
                          <Icon icon="solar:pen-bold" className="w-3 h-3" /> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {expenses.length} of {pagination.total} entries
              {!isAllTime && ` · ${activeLabel}`}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                <Icon icon="solar:arrow-left-bold" className="w-4 h-4 text-gray-500" />
              </button>
              <span className="text-xs text-gray-600 px-2">Page {page} / {pagination.totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                <Icon icon="solar:arrow-right-bold" className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Accounts Payable Aging */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Accounts Payable Aging Report</h2>
          {/* Aging selalu all-time karena berbasis dueDate bukan createdAt */}
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md">
            Based on due date · All time
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {agingReport.map((a, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">{a.label}</p>
                <p className="text-xs text-gray-400">{a.count} transactions</p>
              </div>
              <p className="text-sm font-bold text-gray-900">{fmtRp(a.amount)}</p>
            </div>
          ))}
          {agingReport.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No payable aging data</p>
          )}
        </div>
      </div>
    </div>
  );
}
