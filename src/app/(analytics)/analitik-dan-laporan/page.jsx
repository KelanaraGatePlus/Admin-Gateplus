"use client";

import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Search, Filter, TrendingUp, TrendingDown } from "lucide-react";

export default function AnalitikDanLaporanPage() {
    // State untuk filter chart
    const [chartPeriod, setChartPeriod] = useState("6");

    // Data untuk chart
    const monthlyRevenueData = [
        { month: "Jan", totalRevenue: 8000000, subscriptions: 5000000, purchases: 3000000 },
        { month: "Feb", totalRevenue: 9500000, subscriptions: 6000000, purchases: 3500000 },
        { month: "Mar", totalRevenue: 11000000, subscriptions: 7000000, purchases: 4000000 },
        { month: "Apr", totalRevenue: 10500000, subscriptions: 6500000, purchases: 4000000 },
        { month: "May", totalRevenue: 12000000, subscriptions: 7500000, purchases: 4500000 },
        { month: "Jun", totalRevenue: 13500000, subscriptions: 8500000, purchases: 5000000 },
        { month: "Jul", totalRevenue: 12800000, subscriptions: 8000000, purchases: 4800000 },
        { month: "Aug", totalRevenue: 14000000, subscriptions: 9000000, purchases: 5000000 },
        { month: "Sep", totalRevenue: 13200000, subscriptions: 8500000, purchases: 4700000 },
        { month: "Oct", totalRevenue: 15000000, subscriptions: 9500000, purchases: 5500000 },
        { month: "Nov", totalRevenue: 14500000, subscriptions: 9200000, purchases: 5300000 },
        { month: "Dec", totalRevenue: 12500000, subscriptions: 8000000, purchases: 4500000 },
    ];

    // State untuk Transaction Ledger
    const [transactionSearch, setTransactionSearch] = useState("");
    const [transactions] = useState([
        { id: "TRX001", date: "2024-01-15", user: "John Doe", type: "Subscription", amount: 99000, status: "Success" },
        { id: "TRX002", date: "2024-01-16", user: "Jane Smith", type: "Purchase", amount: 150000, status: "Success" },
        { id: "TRX003", date: "2024-01-17", user: "Bob Wilson", type: "Subscription", amount: 99000, status: "Pending" },
    ]);

    // State untuk Payout Management
    const [payoutSearch, setPayoutSearch] = useState("");
    const [payouts] = useState([
        { id: "PAY001", creator: "Creator A", amount: 2500000, date: "2024-01-20", status: "Completed" },
        { id: "PAY002", creator: "Creator B", amount: 1800000, date: "2024-01-21", status: "Pending" },
        { id: "PAY003", creator: "Creator C", amount: 3200000, date: "2024-01-22", status: "Processing" },
    ]);

    // Kalkulasi statistik
    const currentMonthRevenue = 12500000;
    const lastMonthRevenue = 14500000;
    const revenueChangePercent = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1);
    const pendingPayouts = 7500000;
    const totalTransactions = 1200;
    const platformCommission = 7500000;
    const commissionPercent = 15;

    // Kalkulasi untuk chart stats
    const totalRevenue = monthlyRevenueData.reduce((sum, item) => sum + item.totalRevenue, 0);
    const monthlyAverage = Math.round(totalRevenue / monthlyRevenueData.length);
    const growthRate = 12.3;
    const monthlyProjection = 2500000;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="w-full space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analitik Laporan Keuangan</h1>
                    <p className="text-gray-600 mt-1">Ringkasan performa dan laporan aktivitas sistem</p>
                </div>

                {/* Revenue Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Current Month Revenue */}
                    <div className="bg-gray-200 rounded-xl p-6">
                        <div className="text-sm text-gray-600 mb-2">Current Month Revenue</div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                            Rp {currentMonthRevenue.toLocaleString('id-ID')}
                        </div>
                        <div className={`flex items-center gap-1 text-sm ${revenueChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {revenueChangePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span className="font-medium">{Math.abs(revenueChangePercent)}%</span>
                            <span className="text-gray-500">from last month</span>
                        </div>
                    </div>

                    {/* Pending Payouts */}
                    <div className="bg-gray-200 rounded-xl p-6">
                        <div className="text-sm text-gray-600 mb-2">Pending Payouts</div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                            Rp {pendingPayouts.toLocaleString('id-ID')}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-green-600">
                            <TrendingDown className="w-4 h-4" />
                            <span className="font-medium">-25%</span>
                            <span className="text-gray-500">{totalTransactions} Transactions This Month</span>
                        </div>
                    </div>

                    {/* Platform Commission */}
                    <div className="bg-gray-200 rounded-xl p-6">
                        <div className="text-sm text-gray-600 mb-2">Platform Commission</div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                            {platformCommission.toLocaleString('id-ID')}
                        </div>
                        <div className="text-sm text-gray-500">
                            {commissionPercent}% of Total Transactions
                        </div>
                    </div>
                </div>

                {/* Monthly Revenue Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">Monthly Revenue Chart</h2>
                            <p className="text-sm text-gray-600">Monthly revenue analysis from subscriptions and purchases</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setChartPeriod("6")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    chartPeriod === "6" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                6 Months
                            </button>
                            <button
                                onClick={() => setChartPeriod("12")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    chartPeriod === "12" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                12 Months
                            </button>
                            <button
                                onClick={() => setChartPeriod("36")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    chartPeriod === "36" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                36 Months
                            </button>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex gap-6 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                            <span className="text-sm text-gray-600">Total Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-400 rounded"></div>
                            <span className="text-sm text-gray-600">Subscriptions</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-400 rounded"></div>
                            <span className="text-sm text-gray-600">Purchases</span>
                        </div>
                    </div>

                    {/* Chart */}
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyRevenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip 
                                formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                            <Line type="monotone" dataKey="totalRevenue" stroke="#facc15" strokeWidth={3} dot={{ fill: '#facc15', r: 4 }} />
                            <Line type="monotone" dataKey="subscriptions" stroke="#4ade80" strokeWidth={3} dot={{ fill: '#4ade80', r: 4 }} />
                            <Line type="monotone" dataKey="purchases" stroke="#f87171" strokeWidth={3} dot={{ fill: '#f87171', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>

                    {/* Stats Below Chart */}
                    <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t">
                        <div className="text-center">
                            <div className="text-sm text-gray-600 mb-1">Monthly Average</div>
                            <div className="text-2xl font-bold text-green-600">Rp {monthlyAverage.toLocaleString('id-ID')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-600 mb-1">Growth Rate</div>
                            <div className="text-2xl font-bold text-green-600">+{growthRate}%</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-600 mb-1">Monthly Projection</div>
                            <div className="text-2xl font-bold text-blue-600">Rp {monthlyProjection.toLocaleString('id-ID')}</div>
                        </div>
                    </div>
                </div>

                {/* Tabel Transaksi (Transaction Ledger) */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Tabel Transaksi (Transaction Ledger)</h2>
                        
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search"
                                    value={transactionSearch}
                                    onChange={(e) => setTransactionSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Filter
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Transaction ID</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{transaction.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{transaction.date}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{transaction.user}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{transaction.type}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">Rp {transaction.amount.toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                transaction.status === 'Success' ? 'bg-green-100 text-green-700' :
                                                transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {transaction.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="border-t border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing 1 to {transactions.length} of {transactions.length} entries
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition">
                                    Previous
                                </button>
                                <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
                                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition">2</button>
                                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition">3</button>
                                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pembayaran Creator (Payout Management) */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Pembayaran Creator (Payout Management)</h2>
                        
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search"
                                    value={payoutSearch}
                                    onChange={(e) => setPayoutSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Filter
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Payout ID</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Creator</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {payouts.map((payout) => (
                                    <tr key={payout.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{payout.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{payout.creator}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">Rp {payout.amount.toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{payout.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                payout.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                payout.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                payout.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {payout.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                                                Process
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="border-t border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing 1 to {payouts.length} of {payouts.length} entries
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition">
                                    Previous
                                </button>
                                <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
                                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition">2</button>
                                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition">3</button>
                                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}