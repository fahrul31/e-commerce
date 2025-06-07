'use client';

import React, { useState } from 'react';
import { User, ShoppingBag, Settings, LogOut } from 'lucide-react';
import ProfileSection from '@/app/components/customer/ProfileSection';
import TransactionSection from '@/app/components/customer/TransactionSection';
import { signOut } from "next-auth/react";

const ProfileLayout = () => {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-800">Akun Saya</h1>
                            <div className="flex items-center gap-3">
                                <span className="text-6xl animate-bounce">🛍️</span>
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    E-Shop
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex gap-8">
                        {/* Sidebar */}
                        <div className="w-80 flex-shrink-0">
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-8">
                                <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">

                                </div>

                                <div className="p-2">
                                    {[
                                        { id: 'profile', label: 'Profil Saya', icon: User },
                                        { id: 'transactions', label: 'Riwayat Transaksi', icon: ShoppingBag },
                                    ].map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveTab(item.id)}
                                                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 mb-2 ${activeTab === item.id
                                                    ? 'bg-blue-50 border-2 border-blue-200 text-blue-700'
                                                    : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                                                    }`}
                                            >
                                                <Icon size={20} />
                                                <div className="text-left">
                                                    <p className="font-medium">{item.label}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="p-4 border-t border-gray-100">
                                    <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-4 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300">
                                        <LogOut size={20} />
                                        <span className="font-medium">Keluar</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-8">
                                {activeTab === 'profile' && (
                                    <ProfileSection />
                                )}
                                {activeTab === 'transactions' && <TransactionSection />}
                                {activeTab === 'settings' && (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">⚙️</div>
                                        <p className="text-gray-500 text-lg">Pengaturan</p>
                                        <p className="text-gray-400 text-sm mt-2">Fitur ini akan segera hadir</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileLayout;
