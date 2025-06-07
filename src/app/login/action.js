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

    // 3. Redirect berdasarkan role
    if (session.user.role === 'teacher') {
        window.location.href = '/admin/dashboard';
    } else if (session.user.role === 'student') {
        window.location.href = '/customer/index';
    } else {
        window.location.href = '/';
    }

    return { success: true };
}
