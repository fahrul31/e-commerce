'use client'
import { redirect } from 'next/navigation';
export default async function registerData({ name, email, password, confirmPassword }) {


    if (password != confirmPassword) {
        return {
            success: false,
            message: "Password tidak sama"
        };
    }
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password }),
    });

    const responseData = await response.json();
    if (responseData.success) {
        return {
            success: true,
            message: "Pendaftaran berhasil",
            data: responseData.message
        }
    } else {
        console.log("Registration failed:", responseData.message);
        return {
            success: false,
            message: responseData.message || "Terjadi kesalahan saat mendaftar"
        };
    }
}