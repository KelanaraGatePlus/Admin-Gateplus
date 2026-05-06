import backendUrl from "@/const/backendUrl";

const BASE_URL = `${backendUrl}/discountVoucher`;

// ── Helper: Bearer Token ───────────────────────────────────────────────────
const getAuthHeader = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("No authentication token found. Please login.");
    }

    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

// ── GET semua voucher (Superadmin only) ───────────────────────────────────
export const getVouchers = async () => {
    try {
        const res = await fetch(BASE_URL, {
            headers: getAuthHeader(),
        });

        if (!res.ok) {
            const errorData = await res
                .json()
                .catch(() => ({ message: "Failed to fetch vouchers" }));
            throw new Error(errorData.message || "Failed to fetch vouchers");
        }

        return res.json();
    } catch (error) {
        console.error("❌ getVouchers error:", error);
        throw error;
    }
};

// ── GET voucher by ID (Superadmin only) ───────────────────────────────────
export const getVoucherById = async (id) => {
    try {
        const res = await fetch(`${BASE_URL}/${id}`, {
            headers: getAuthHeader(),
        });

        if (!res.ok) {
            const errorData = await res
                .json()
                .catch(() => ({ message: "Failed to fetch voucher" }));
            throw new Error(errorData.message || "Failed to fetch voucher");
        }

        return res.json();
    } catch (error) {
        console.error("❌ getVoucherById error:", error);
        throw error;
    }
};

// ── POST tambah voucher (Superadmin only) ─────────────────────────────────
export const createVoucher = async (voucherData) => {
    try {
        console.log("📤 Sending voucher data:", voucherData);

        const res = await fetch(BASE_URL, {
            method: "POST",
            headers: getAuthHeader(),
            body: JSON.stringify(voucherData),
        });

        const responseText = await res.text();
        console.log("📥 Response:", responseText);

        if (!res.ok) {
            let errorMessage = "Failed to create voucher";
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message || errorMessage;
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    errorMessage = errorData.errors
                        .map((e) => `${e.field}: ${e.message}`)
                        .join(", ");
                }
            } catch {
                errorMessage = responseText;
            }
            throw new Error(errorMessage);
        }

        return JSON.parse(responseText);
    } catch (error) {
        console.error("❌ createVoucher error:", error);
        throw error;
    }
};

// ── PATCH update voucher (Superadmin only) ────────────────────────────────
export const updateVoucher = async (id, voucherData) => {
    try {
        console.log("📤 Updating voucher:", id, voucherData);

        const res = await fetch(`${BASE_URL}/${id}`, {
            method: "PATCH",
            headers: getAuthHeader(),
            body: JSON.stringify(voucherData),
        });

        if (!res.ok) {
            const errorData = await res
                .json()
                .catch(() => ({ message: "Failed to update voucher" }));
            throw new Error(errorData.message || "Failed to update voucher");
        }

        return res.json();
    } catch (error) {
        console.error("❌ updateVoucher error:", error);
        throw error;
    }
};

// ── DELETE voucher (Superadmin only) ──────────────────────────────────────
export const deleteVoucher = async (id) => {
    try {
        const res = await fetch(`${BASE_URL}/${id}`, {
            method: "DELETE",
            headers: getAuthHeader(),
        });

        if (!res.ok) {
            const errorData = await res
                .json()
                .catch(() => ({ message: "Failed to delete voucher" }));
            throw new Error(errorData.message || "Failed to delete voucher");
        }

        return res.json();
    } catch (error) {
        console.error("❌ deleteVoucher error:", error);
        throw error;
    }
};

// ── GET validasi & hitung diskon (All authenticated users) ────────────────
export const validateVoucher = async (code, amount) => {
    try {
        const res = await fetch(`${BASE_URL}/count-discount/${code}/${amount}`, {
            headers: getAuthHeader(),
        });

        if (!res.ok) {
            const errorData = await res
                .json()
                .catch(() => ({ message: "Voucher validation failed" }));
            throw new Error(errorData.message || "Voucher validation failed");
        }

        return res.json();
    } catch (error) {
        console.error("❌ validateVoucher error:", error);
        throw error;
    }
};

// ── GET total savings (Superadmin only) ───────────────────────────────────
export const getTotalSavings = async () => {
    try {
        const res = await fetch(`${BASE_URL}/total-savings`, {
            headers: getAuthHeader(),
        });

        if (!res.ok) {
            const errorData = await res
                .json()
                .catch(() => ({ message: "Failed to fetch total savings" }));
            throw new Error(errorData.message || "Failed to fetch total savings");
        }

        return res.json();
    } catch (error) {
        console.error("❌ getTotalSavings error:", error);
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Whitelist tipe konten yang diizinkan di sisi frontend.
// Harus sinkron dengan CONTENT_TYPE_CONFIG di contentSearchController.js.
// ─────────────────────────────────────────────────────────────────────────────
const ALLOWED_CONTENT_TYPES = new Set([
    "EBOOK",
    "COMIC",
    "PODCAST",
    "FILM",
    "SERIES",
    "EDUCATION",
]);

// Minimum karakter sebelum request dikirim — sinkron dengan SEARCH_MIN_LENGTH
// di contentSearchController.js (sama-sama 2).
const SEARCH_MIN_LENGTH = 2;

const MAX_LIMIT = 10;

/**
 * Search konten berdasarkan contentType dan keyword.
 * Digunakan di form voucher untuk memilih contentId.
 *
 * Sekarang hanya hit 1 endpoint terpusat:
 *   GET /discountVoucher/content/search?type=EBOOK&q=naruto&limit=10
 *
 * Backend yang handle routing ke service yang tepat —
 * frontend tidak perlu tahu endpoint per konten.
 *
 * Return: Array of { id: string, label: string }
 */
export const searchContentByType = async (contentType, keyword) => {
    // ── Guard 1: tipe konten harus ada di whitelist ────────────────────────
    if (!contentType || !ALLOWED_CONTENT_TYPES.has(contentType.toUpperCase())) {
        console.warn("searchContentByType: contentType tidak dikenal →", contentType);
        return [];
    }

    // ── Guard 2: keyword wajib cukup panjang sebelum hit backend ──────────
    // Ini mencegah request fired saat user baru ketik 1 huruf,
    // dan konsisten dengan validasi yang sama di backend.
    const trimmedKeyword = keyword?.trim() ?? "";
    if (trimmedKeyword.length < SEARCH_MIN_LENGTH) {
        return [];
    }

    try {
        const url =
            `${BASE_URL}/content/search` +
            `?type=${encodeURIComponent(contentType.toUpperCase())}` +
            `&q=${encodeURIComponent(trimmedKeyword)}` +
            `&limit=${MAX_LIMIT}`;

        const res = await fetch(url, {
            headers: getAuthHeader(),
        });

        // ── Guard 3: tangani HTTP error secara eksplisit ───────────────────
        if (res.status === 401) {
            console.error("searchContentByType: token tidak valid atau expired");
            return [];
        }

        if (res.status === 403) {
            console.error("searchContentByType: akses ditolak (bukan Superadmin?)");
            return [];
        }

        if (!res.ok) {
            console.error(`searchContentByType: HTTP ${res.status}`);
            return [];
        }

        const json = await res.json();

        // Backend sudah normalisasi ke { id, label } — langsung pakai
        if (!Array.isArray(json.data)) {
            console.warn("searchContentByType: response.data bukan array");
            return [];
        }

        return json.data;
    } catch (error) {
        // Network error (offline, CORS, dsb) — jangan throw agar UI tidak crash
        console.error("❌ searchContentByType network error:", error);
        return [];
    }
};