'use client';

import { signIn, getSession } from 'next-auth/react';

export default async function loginData({ email, password }) {
    // 1. Login user
    const result = await signIn('credentials', {
        redirect: false,
        email,
        password
    });

    if (!result.ok) {
        return {
            success: false,
            message: result.error
        };
    }

    // 2. Ambil session setelah login berhasil
    const session = await getSession();

    if (!session?.user?.role) {
        return {
            success: false,
            message: "Gagal mendapatkan session"
        };
    }

    return { success: true };
}
