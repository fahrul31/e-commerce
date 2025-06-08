'use server'

import { cookies, headers } from "next/headers";
import { redirect } from 'next/navigation';
import * as JWT from "@/app/utils/jwt/jwt";


export default async function login({ name, email, password, confirmPassword }) {
    const cookieStore = await cookies(); // Ambil cookies terlebih dahulu
    const csrfCookie = cookieStore.get("next-auth.csrf-token")?.value;

    if (password != confirmPassword) {
        return {
            success: false,
            message: "Password tidak sama"
        };
    }
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Csrf-Token': csrfCookie
        },
        body: JSON.stringify({ name, email, password }),
    });

    const responseData = await response.json();
    if (response.ok && responseData.success) {
        redirect('/login');
    } else {
        console.log("Registration failed:", responseData.message);
        return {
            success: false,
            message: responseData.message || "Terjadi kesalahan saat mendaftar"
        };
    }
}