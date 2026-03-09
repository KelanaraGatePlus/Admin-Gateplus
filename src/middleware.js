import { NextResponse } from "next/server";
import * as jose from "jose";

const MAINTENANCE_MODE = false;

export async function middleware(req) {
    const { pathname, searchParams } = req.nextUrl;

    /* =========================
       🧩 1. Maintenance Mode
    ========================== */
    if (MAINTENANCE_MODE && pathname !== "/maintenance") {
        return NextResponse.redirect(new URL("/maintenance", req.url));
    }
    if (!MAINTENANCE_MODE && pathname === "/maintenance") {
        return NextResponse.redirect(new URL("/", req.url));
    }

    /* =========================
       🧩 2. Path Konfigurasi
    ========================== */
    const VERIFICATION_PATHS = ["/otp", "/verify-email", '/forgot-password'];
    const PUBLIC_PATHS = [
        "/login",
    ];

    /* =========================
       🧩 3. Ambil token
    ========================== */
    const cookieToken = req.cookies.get("token")?.value || localStorage.getItem("token");
    const urlToken = searchParams.get("token");
    const token = cookieToken || urlToken;
    console.log("Retrieved token:", token);

    /* =========================
       🧩 4. Public Path tanpa token
    ========================== */
    if (PUBLIC_PATHS.includes(pathname) && !token) {
        return NextResponse.next();
    }

    /* =========================
       🧩 5. Jika tidak ada token sama sekali
    ========================== */
    if (!token || token.trim() === "") {
        console.log("No token found, redirecting to login.");
        return NextResponse.redirect(new URL("/login", req.url));
    }

    /* =========================
       🧩 6. Verifikasi token JWT
    ========================== */
    try {
        // eslint-disable-next-line no-undef
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);

        const now = Math.floor(Date.now() / 1000);

        if (payload.role !== 'Superadmin') {
            console.log("Invalid role in token, redirecting to login.");
            const res = NextResponse.redirect(new URL("/login", req.url));
            return res;
        }

        // Token expired
        if (payload.exp && payload.exp < now) {
            const res = NextResponse.redirect(new URL("/session-expired", req.url));
            res.cookies.delete("token");
            return res;
        }

        // Jika user sudah verified tapi akses ke halaman otp
        if (payload.isVerified && VERIFICATION_PATHS.includes(pathname)) {
            return NextResponse.redirect(new URL("/", req.url));
        }

        // Jika user belum verified tapi akses ke halaman selain otp/verify-email
        if (!payload.isVerified && !VERIFICATION_PATHS.includes(pathname)) {
            // Bawa token di query supaya halaman OTP tahu
            const url = new URL("/otp", req.url);
            url.searchParams.set("token", token);
            return NextResponse.redirect(url);
        }

        // ✅ Jika semua valid
        return NextResponse.next();
    } catch (err) {
        console.error("Token verification failed:", err);
        const res = NextResponse.redirect(new URL("/session-expired", req.url));
        res.cookies.delete("token");
        return res;
    }
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
