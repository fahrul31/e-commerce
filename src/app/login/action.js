'use client';

import { signIn } from 'next-auth/react';

export default async function loginData({ email, password }) {
    const result = await signIn('credentials', {
        redirect: false,
        email,
        password
    });

    if (result?.error) {
        return {
            success: false,
            message: result.error,
            error: result.error
        };
    }

    return {
        success: true,
        message: 'Login berhasil',
    };
}