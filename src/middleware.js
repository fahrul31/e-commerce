import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

const redirectRoutes = {
    admin: "/admin/products",
    customer: "/dashboard",
};

const publicRoutes = ["/dashboard", "/login", "/register"];

const protectedRoutes = {
    admin: ["/admin"],
    customer: ["/profile", "/cart", "/checkout", "/transactions", "/products"],
};

function isProtected(pathname, routes) {
    return routes.some((route) => pathname.startsWith(route));
}

export async function middleware(req) {
    const { pathname, origin } = req.nextUrl;

    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon.ico") ||
        pathname.startsWith("/api")
    ) {
        return NextResponse.next();
    }

    const token = await getToken({ req, secret });

    // Jika user sudah login dan mengakses login/register
    if (publicRoutes.includes(pathname)) {
        if (token?.role) {
            const redirectPath = redirectRoutes[token.role];
            if (pathname !== redirectPath) {
                return NextResponse.redirect(new URL(redirectPath, origin));
            }
        }
        return NextResponse.next();
    }

    const allProtected = [
        ...protectedRoutes.admin,
        ...protectedRoutes.customer
    ];

    if (!token) {
        if (isProtected(pathname, allProtected)) {
            return NextResponse.redirect(new URL("/login", origin));
        }
        return NextResponse.next();
    }

    const userRole = token.role;

    if (pathname.startsWith("/checkout")) {
        const referer = req.headers.get("referer") || "";
        const refererPath = new URL(referer, origin).pathname;

        if (refererPath !== "/cart") {
            console.warn("🚫 Akses ke /checkout ditolak karena bukan dari /cart");
            return NextResponse.redirect(new URL("/cart", origin));
        }
    }

    if (userRole === "admin") {
        if (!pathname.startsWith("/admin")) {
            return NextResponse.redirect(new URL("/admin/products", origin));
        }
    } else if (userRole === "customer") {
        const allowedRoutes = protectedRoutes.customer;
        if (!isProtected(pathname, allowedRoutes)) {
            return NextResponse.redirect(new URL("/dashboard", origin));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/dashboard",
        "/profile",
        "/cart",
        // "/checkout",
        "/transactions",
        "/admin/:path*",
        "/login",
        "/register",
        "/products/:path*",
    ],
};
