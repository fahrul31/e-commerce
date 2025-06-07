'use client';

import React, { useState, useEffect } from 'react';
import {
    User, Edit3, Save, X, Mail, Phone, Lock,
    Plus, Trash2, Eye, EyeOff
} from 'lucide-react';
import { getProfile, updateProfile, saveAddress, deleteAddress, changePassword } from '@/app/utils/actions/profile';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Swal from 'sweetalert2';

const profileSchema = Yup.object().shape({
    name: Yup.string().required('Nama lengkap wajib diisi'),
    email: Yup.string().email('Format email tidak valid').required('Email wajib diisi'),
    phone: Yup.string().required('Nomor telepon wajib diisi'),
});

const addressSchema = Yup.object().shape({
    full_address: Yup.string().required('Alamat lengkap wajib diisi'),
    city: Yup.string().required('Kota wajib diisi'),
    postal_code: Yup.string().required('Kode pos wajib diisi'),
    is_primary: Yup.boolean(),
});

const passwordSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Password saat ini wajib diisi'),
    newPassword: Yup.string()
        .required('Password baru wajib diisi')
        .min(8, 'Minimal 8 karakter')
        .matches(/[A-Z]/, 'Harus ada huruf besar')
        .matches(/[a-z]/, 'Harus ada huruf kecil')
        .matches(/\d/, 'Harus ada angka'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Password tidak cocok')
        .required('Konfirmasi password wajib diisi'),
});

const ProfileSection = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        addresses: []
    });

    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        reset: resetProfile,
        formState: { errors: profileErrors }
    } = useForm({
        resolver: yupResolver(profileSchema)
    });

    const {
        register: registerAddress,
        handleSubmit: handleAddressSubmit,
        reset: resetAddress,
        formState: { errors: addressErrors }
    } = useForm({
        resolver: yupResolver(addressSchema)
    });

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
        formState: { errors: passwordErrors }
    } = useForm({
        resolver: yupResolver(passwordSchema)
    });

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        setIsLoading(true);
        try {
            const res = await getProfile();
            if (res.success) {
                setProfileData(res.data);
                resetProfile(res.data);
            } else {
                await Swal.fire('Gagal', res.message || 'Gagal memuat data profil', 'error');
            }
        } catch (error) {
            await Swal.fire('Error', 'Terjadi kesalahan saat memuat profil', 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (data) => {
        setIsLoading(true);
        try {
            const res = await updateProfile(data);
            if (res.success) {
                setProfileData(res.data);
                setIsEditing(false);
                await Swal.fire('Berhasil', 'Profil berhasil diperbarui', 'success');
            } else {
                await Swal.fire('Gagal', res.message || 'Gagal memperbarui profil', 'error');
            }
        } catch (error) {
            await Swal.fire('Error', 'Terjadi kesalahan saat memperbarui profil', 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        resetProfile(profileData);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setShowPasswordModal(false);
        setShowAddressModal(false);
        setEditingAddress(null);
        resetProfile(profileData);
        resetPassword();
        resetAddress();
    };

    const openAddressModal = (address = null) => {
        setEditingAddress(address);
        if (address) resetAddress(address);
        else resetAddress();
        setShowAddressModal(true);
    };

    const handleAddressSave = async (data) => {
        setIsLoading(true);
        try {
            const payload = { ...data };
            if (editingAddress?.id) payload.id = editingAddress.id;

            const res = await saveAddress(payload);
            if (res.success) {
                setProfileData(res.data);
                setShowAddressModal(false);
                setEditingAddress(null);
                resetAddress();
                await Swal.fire('Berhasil', 'Alamat berhasil disimpan', 'success');
            } else {
                await Swal.fire('Gagal', res.message || 'Gagal menyimpan alamat', 'error');
            }
        } catch (error) {
            await Swal.fire('Error', 'Terjadi kesalahan saat menyimpan alamat', 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        const confirmResult = await Swal.fire({
            title: 'Yakin ingin menghapus alamat ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });

        if (!confirmResult.isConfirmed) return;

        setIsLoading(true);
        try {
            const res = await deleteAddress(addressId);
            if (res.success) {
                await fetchProfileData();
                await Swal.fire('Berhasil', 'Alamat berhasil dihapus', 'success');
            } else {
                await Swal.fire('Gagal', res.message || 'Gagal menghapus alamat', 'error');
            }
        } catch (error) {
            await Swal.fire('Error', 'Terjadi kesalahan saat menghapus alamat', 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (data) => {
        setIsLoading(true);
        try {
            const res = await changePassword(data.currentPassword, data.newPassword);
            if (res.success) {
                setShowPasswordModal(false);
                resetPassword();
                await Swal.fire('Berhasil', 'Password berhasil diperbarui', 'success');
            } else {
                await Swal.fire('Gagal', res.message || 'Gagal memperbarui password', 'error');
            }
        } catch (error) {
            await Swal.fire('Error', 'Terjadi kesalahan saat memperbarui password', 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl z-0"></div>
                <div className="absolute top-4 right-4 z-10">
                    {!isEditing ? (
                        <div className="flex gap-2">
                            <button
                                onClick={handleEdit}
                                className="group flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-300"
                            >
                                <Edit3 size={18} />
                                <span className="font-medium">Edit Profil</span>
                            </button>
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="group flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-300"
                            >
                                <Lock size={18} />
                                <span className="font-medium">Ubah Password</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="group flex items-center gap-2 px-4 py-2 bg-green-500/80 backdrop-blur-sm text-white rounded-full hover:bg-green-600/80 transition-all duration-300 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                ) : (
                                    <Save size={18} />
                                )}
                                <span className="font-medium">{isLoading ? 'Menyimpan...' : 'Simpan'}</span>
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="group flex items-center gap-2 px-4 py-2 bg-red-500/80 backdrop-blur-sm text-white rounded-full hover:bg-red-600/80 transition-all duration-300 disabled:opacity-50"
                            >
                                <X size={18} />
                                <span className="font-medium">Batal</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="relative px-8 py-12 text-center text-white">
                    <div className="mb-6">
                        <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/30">
                            <User size={48} className="text-white" />
                        </div>
                        {!isEditing ? (
                            <h2 className="text-3xl font-bold mb-2">{profileData.name}</h2>
                        ) : (
                            <div>
                                <input
                                    {...registerProfile('name')}
                                    type="text"
                                    className="text-3xl font-bold mb-2 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 rounded-lg px-4 py-2 text-center border border-white/30 focus:border-white/60 focus:outline-none w-full"
                                    placeholder="Nama lengkap"
                                />
                                {profileErrors.name && (
                                    <p className="text-red-200 text-sm mt-1">{profileErrors.name.message}</p>
                                )}
                            </div>
                        )}
                        <p className="text-blue-100">Member sejak 2024</p>
                    </div>
                </div>
            </div>

            {/* Kontak */}
            <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                    <span className="text-2xl">📝</span>
                    Informasi Kontak
                </h3>
                <div className="space-y-6">
                    {/* Email */}
                    <div className="group">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                            <Mail size={16} />
                            Email
                        </label>
                        {!isEditing ? (
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                                <p className="text-gray-800 font-medium">{profileData.email}</p>
                            </div>
                        ) : (
                            <div>
                                <input
                                    {...registerProfile('email')}
                                    type="email"
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-300"
                                    placeholder="Email address"
                                />
                                {profileErrors.email && (
                                    <p className="text-red-500 text-sm mt-1">{profileErrors.email.message}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="group">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                            <Phone size={16} />
                            Nomor Telepon
                        </label>
                        {!isEditing ? (
                            <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-100">
                                <p className="text-gray-800 font-medium">{profileData.phone || '-'}</p>
                            </div>
                        ) : (
                            <div>
                                <input
                                    {...registerProfile('phone')}
                                    type="tel"
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-300"
                                    placeholder="Nomor telepon"
                                />
                                {profileErrors.phone && (
                                    <p className="text-red-500 text-sm mt-1">{profileErrors.phone.message}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Alamat */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                        <span className="text-2xl">🏠</span>
                        Alamat
                    </h3>
                    {profileData.addresses?.length < 3 && (
                        <button
                            onClick={() => openAddressModal()}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={18} />
                            <span>Tambah Alamat</span>
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {profileData.addresses?.map((address) => (
                        <div
                            key={address.id}
                            className="relative p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl border border-orange-100"
                        >
                            {address.is_primary && (
                                <span className="absolute top-2 right-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                    Alamat Utama
                                </span>
                            )}
                            <div className="pr-24">
                                <p className="text-gray-800 font-medium mb-2">{address.full_address}</p>
                                <p className="text-gray-600 text-sm">
                                    {address.city}, {address.postal_code}
                                </p>
                            </div>
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    onClick={() => openAddressModal(address)}
                                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    <Edit3 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteAddress(address.id)}
                                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Ubah Password</h3>

                        <form onSubmit={handlePasswordSubmit(handlePasswordChange)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Password Saat Ini
                                </label>
                                <div className="relative">
                                    <input
                                        {...registerPassword('currentPassword')}
                                        type={showPassword ? 'text' : 'password'}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                        placeholder="Masukkan password saat ini"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {passwordErrors.currentPassword && (
                                    <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Password Baru
                                </label>
                                <div className="relative">
                                    <input
                                        {...registerPassword('newPassword')}
                                        type={showNewPassword ? 'text' : 'password'}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                        placeholder="Masukkan password baru"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {passwordErrors.newPassword && (
                                    <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Konfirmasi Password Baru
                                </label>
                                <div className="relative">
                                    <input
                                        {...registerPassword('confirmPassword')}
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                        placeholder="Konfirmasi password baru"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {passwordErrors.confirmPassword && (
                                    <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? 'Menyimpan...' : 'Simpan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Address Modal */}
            {showAddressModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            {editingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}
                        </h3>

                        <form onSubmit={handleAddressSubmit(handleAddressSave)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Alamat Lengkap
                                </label>
                                <textarea
                                    {...registerAddress('full_address')}
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none"
                                    placeholder="Masukkan alamat lengkap"
                                />
                                {addressErrors.full_address && (
                                    <p className="text-red-500 text-sm mt-1">{addressErrors.full_address.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Kota
                                </label>
                                <input
                                    {...registerAddress('city')}
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                    placeholder="Masukkan kota"
                                />
                                {addressErrors.city && (
                                    <p className="text-red-500 text-sm mt-1">{addressErrors.city.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Kode Pos
                                </label>
                                <input
                                    {...registerAddress('postal_code')}
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                    placeholder="Masukkan kode pos"
                                />
                                {addressErrors.postal_code && (
                                    <p className="text-red-500 text-sm mt-1">{addressErrors.postal_code.message}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    {...registerAddress('is_primary')}
                                    type="checkbox"
                                    id="is_primary"
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="is_primary" className="text-sm font-medium text-gray-600">
                                    Jadikan alamat utama
                                </label>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? 'Menyimpan...' : 'Simpan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileSection;
