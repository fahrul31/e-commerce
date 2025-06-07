"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Mail, Lock, Eye, EyeOff, ShoppingBag, Check } from 'lucide-react';
import SocialLoginButtons from '../components/socialLoginButtons';
import loginData from "./action";

const loginSchema = Yup.object({
    email: Yup.string().email("Email tidak valid").required("Email tidak boleh kosong"),
    password: Yup.string().required("Kata sandi tidak boleh kosong"),
});

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(loginSchema)
    });

    const handleLogin = async (data) => {
        setErrorMessage('');
        setIsLoading(true);
        const result = await loginData(data);

        if (!result.success) {
            setErrorMessage(result.message || "Login gagal");
            alert(result.message);
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex">
            {/* Branding Side */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 flex-col justify-center items-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative z-10 text-center max-w-md">
                    <ShoppingBag className="h-16 w-16 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold mb-2">ShopMart</h1>
                    <p className="text-xl opacity-90">Your Shopping Paradise</p>
                    <div className="space-y-4 mt-8">
                        <div className="flex items-center"><Check className="h-5 w-5 mr-3 text-green-300" /><span>Ribuan produk berkualitas</span></div>
                        <div className="flex items-center"><Check className="h-5 w-5 mr-3 text-green-300" /><span>Pengiriman cepat & aman</span></div>
                        <div className="flex items-center"><Check className="h-5 w-5 mr-3 text-green-300" /><span>Jaminan uang kembali</span></div>
                    </div>
                </div>
            </div>

            {/* Login Form Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="lg:hidden mb-6">
                            <ShoppingBag className="h-12 w-12 mx-auto text-indigo-600 mb-2" />
                            <h1 className="text-2xl font-bold text-gray-900">ShopMart</h1>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Selamat Datang Kembali</h2>
                        <p className="mt-2 text-gray-600">Masuk ke akun Anda untuk melanjutkan belanja</p>
                    </div>

                    <SocialLoginButtons />

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">atau masuk dengan email</span>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="bg-red-100 text-red-600 px-4 py-2 rounded-md text-sm">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="nama@email.com"
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Masukkan password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                        </div>


                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Memproses...
                                </div>
                            ) : 'Masuk'}
                        </button>
                    </form>

                    <div className="text-center">
                        <span className="text-gray-600">Belum punya akun? </span>
                        <a href="/register" className="text-indigo-600 hover:text-indigo-500 font-medium">Daftar sekarang</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
