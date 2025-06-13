'use client';

import { signIn, getSession } from 'next-auth/react';

export default async function loginData({ email, password }) {
    // 1. Login user
    const result = await signIn('credentials', {
        callbackUrl: '/dashboard',
        redirect: true,
        email,
        password
    });

    if (!result.ok) {
        return {
            success: false,
            message: result.error
        };
    }

    return { success: true };
}
