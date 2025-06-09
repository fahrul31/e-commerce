"use client";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import registerData from "./action";
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, ShoppingBag, Check, X } from 'lucide-react';
import SocialLoginButtons from '../components/socialLoginButtons';
import Swal from "sweetalert2";

const passwordRequirements = [
    { text: 'Minimal 8 karakter', check: pwd => pwd.length >= 8 },
    { text: 'Mengandung huruf besar', check: pwd => /[A-Z]/.test(pwd) },
    { text: 'Mengandung huruf kecil', check: pwd => /[a-z]/.test(pwd) },
    { text: 'Mengandung angka', check: pwd => /\d/.test(pwd) },
];


const registerSchema = Yup.object().shape({
    name: Yup.string().required('Nama lengkap wajib diisi'),
    email: Yup.string().email('Format email tidak valid').required('Email wajib diisi'),
    password: Yup.string()
        .required('Password wajib diisi')
        .min(8, 'Minimal 8 karakter')
        .matches(/[A-Z]/, 'Harus ada huruf besar')
        .matches(/[a-z]/, 'Harus ada huruf kecil')
        .matches(/\d/, 'Harus ada angka'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Password tidak cocok')
        .required('Konfirmasi password wajib diisi'),
});

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
        resolver: yupResolver(registerSchema)
    });
    const watchPassword = watch('password', '');

    const handleRegister = async (data) => {
        try {
            console.log("Form submitted with data:", data);
            setIsLoading(true);

            const result = await registerData(data);
            console.log(result);
            if (result?.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Registrasi berhasil!',
                    text: result?.message,
                });
                reset();
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1500);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Registrasi gagal',
                    text: result?.message || 'Terjadi kesalahan saat registrasi',
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Terjadi kesalahan pada server.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex">
            {/* Left Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-indigo-700 p-12 flex-col justify-center items-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative z-10 text-center max-w-md">
                    <div className="mb-8">
                        <div className="relative inline-block">
                            <ShoppingBag className="h-16 w-16 mx-auto mb-4" />
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-purple-800">+</span>
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold mb-2">Bergabung Dengan Kami</h1>
                        <p className="text-xl opacity-90">Mulai pengalaman belanja terbaik Anda</p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center"><Check className="h-5 w-5 mr-3 text-green-300" /><span>Akses ke semua produk premium</span></div>
                        <div className="flex items-center"><Check className="h-5 w-5 mr-3 text-green-300" /><span>Notifikasi penawaran khusus</span></div>
                        <div className="flex items-center"><Check className="h-5 w-5 mr-3 text-green-300" /><span>Program loyalitas member</span></div>
                        <div className="flex items-center"><Check className="h-5 w-5 mr-3 text-green-300" /><span>Customer support 24/7</span></div>
                    </div>
                </div>
            </div>

            {/* Right Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="max-w-md w-full space-y-6">
                    <a href="/login" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Login
                    </a>

                    <div className="text-center">
                        <div className="lg:hidden mb-6">
                            <ShoppingBag className="h-12 w-12 mx-auto text-purple-600 mb-2" />
                            <h1 className="text-2xl font-bold text-gray-900">ShopMart</h1>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Buat Akun Baru</h2>
                        <p className="mt-2 text-gray-600">Daftarkan diri Anda dalam beberapa langkah mudah</p>
                    </div>

                    <SocialLoginButtons />

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">atau daftar dengan email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Depan</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    {...register('name')}
                                    type="text" required
                                    className="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="John"
                                />
                            </div>
                            {errors.name && (
                                <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Email & Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    className="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="nama@email.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
                            )}
                        </div>


                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'} required
                                    className="w-full pl-9 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="Buat password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {/* ✅ Validasi password requirements */}
                            {watchPassword && (
                                <div className="mt-2 space-y-1 text-xs">
                                    {passwordRequirements.map((req, i) => {
                                        const ok = req.check(watchPassword);
                                        return (
                                            <div key={i} className="flex items-center">
                                                {ok ? (
                                                    <Check className="h-3 w-3 mr-2 text-green-500" />
                                                ) : (
                                                    <X className="h-3 w-3 mr-2 text-red-500" />
                                                )}
                                                <span className={ok ? 'text-green-600' : 'text-red-600'}>
                                                    {req.text}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    {...register('confirmPassword')}
                                    type={showConfirmPassword ? 'text' : 'password'} required
                                    className="w-full pl-9 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="Ulangi password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>


                                {errors.confirmPassword && (
                                    <p className="text-red-600 text-xs mt-1">{errors.confirmPassword.message}</p>
                                )}
                            </div>
                        </div>


                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 disabled:opacity-50"
                        >
                            {isLoading
                                ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Mendaftar...
                                    </div>
                                )
                                : 'Daftar Sekarang'
                            }
                        </button>
                    </form>

                    <div className="text-center">
                        <span className="text-gray-600">Sudah punya akun? </span>
                        <a href="/login" className="text-purple-600 hover:text-purple-500 font-medium">Masuk di sini</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
