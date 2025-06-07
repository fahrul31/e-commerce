"use client";

import { useEffect, useState } from 'react';
import {
    ShoppingBag,
    MapPin,
    User,
    Lock,
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function CheckoutPage() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [zipCode, setZipCode] = useState('');
    const [shippingOptions, setShippingOptions] = useState([]);
    const [selectedShipping, setSelectedShipping] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [profile, setProfile] = useState(null);

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const dynamicShipping = selectedShipping ? selectedShipping.cost : 0;
    const total = subtotal + dynamicShipping;

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile');
            const data = await res.json();
            if (res.ok && data.success) {
                setProfile(data.data);
                if (data.data.addresses?.length > 0) {
                    const primary = data.data.addresses.find(a => a.is_primary) || data.data.addresses[0];
                    setZipCode(primary.postal_code);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'User belum mengisi alamat Anda',
                        text: 'Silahkan mengisi alamat Anda terlebih dahulu.',
                        confirmButtonText: 'OK'
                    });
                    setTimeout(() => {
                        window.location.href = "/profile";
                    }, 2000);
                }
            }
        } catch (err) {
            console.error('Gagal ambil profil:', err);
        }
    };

    const fetchCart = async () => {
        const res = await fetch("/api/cart");
        const data = await res.json();
        if (data.success) {
            setCartItems(
                data.data.map((item) => ({
                    id: item.product_id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-8 h-8 object-contain" />
                    ) : (
                        '📦'
                    ),
                }))
            );
        }
    };

    const fetchShipping = async () => {
        if (!zipCode) return;
        try {
            const res = await fetch('/api/shipping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ zipCode, originId: 501, weight: 1000 }),
            });
            const data = await res.json();
            if (res.ok && data.costs) {
                setShippingOptions(data.costs);
            } else if (data.data?.costs) {
                setShippingOptions(data.data.costs);
            }
        } catch (err) {
            console.error('Gagal ambil ongkir:', err);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchCart();
    }, []);

    useEffect(() => {
        fetchShipping();
    }, [zipCode]);

    const submitCheckout = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: profile?.id,
                    user_email: profile?.email,
                    shipping_name: profile?.name,
                    shipping_contact: profile?.phone,
                    shipping_address: profile?.addresses?.[0]?.full_address,
                    shipping_courier: selectedShipping?.name,
                    shipping_service: selectedShipping?.service,
                    shipping_cost: selectedShipping?.cost,
                }),
            });

            const data = await res.json();
            console.log(data.data);
            if (res.ok && data.success) {
                window.snap.pay(data.data.snap_token, {
                    onSuccess: (result) => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Pembayaran berhasil!',
                            text: 'Pembayaran telah sukses dilakukan.',
                            confirmButtonText: 'OK'
                        });
                        const paymentMethod = result.payment_type;
                        const orderId = data.data.order_id;
                        const reference = data.data.reference;
                        updateTransactionStatus(orderId, reference, paymentMethod);
                        window.location.href = "/index";

                    },
                    onPending: () => {
                        Swal.fire({
                            icon: 'pending',
                            title: 'Checkout Pending',
                            text: "Cek notifikasi email untuk membayar pesanan",
                            confirmButtonText: 'Coba Lagi'
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Checkout gagal',
                            text: "Cek notifikasi email untuk membayar pesanan",
                            confirmButtonText: 'Coba Lagi'
                        });
                    },
                });
            } else {
                alert("Checkout gagal: " + data.message);
            }
        } catch (e) {
            alert("Checkout error: " + e.message);
        }
        setIsProcessing(false);
    };

    // Function to update transaction status in database after payment success
    const updateTransactionStatus = async (orderId, reference, paymentMethod) => {
        console.log(orderId, reference);
        try {
            const res = await fetch('/api/checkout/callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: orderId,
                    reference: reference,
                    payment_type: paymentMethod
                }),
            });


            const data = await res.json();
            if (res.ok && data.success) {
                console.log('Transaction status updated:', data.message);
            } else {
                console.log('Error updating transaction:', data.message);
            }
        } catch (error) {
            console.error('Error updating transaction status:', error);
        }
    };




    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
                    <p className="text-gray-600">Lengkapi informasi untuk menyelesaikan pesanan Anda</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <User className="h-5 w-5 text-indigo-600 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-900">Informasi Pembeli</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                                    <input className="w-full px-3 py-2 border rounded-lg" value={profile?.name || ''} readOnly />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input className="w-full px-3 py-2 border rounded-lg" value={profile?.email || ''} readOnly />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Telepon</label>
                                    <input className="w-full px-3 py-2 border rounded-lg" value={profile?.phone || ''} readOnly />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <MapPin className="h-5 w-5 text-indigo-600 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-900">Alamat Pengiriman</h2>
                            </div>
                            {profile?.addresses?.length > 0 && (
                                <div className="space-y-2">
                                    {profile.addresses.map((addr) => (
                                        <div key={addr.id} className={`border p-3 rounded-md text-sm ${addr.is_primary ? 'bg-indigo-50 border-indigo-400' : 'bg-white border-gray-200'}`}>
                                            <p className="font-medium text-gray-800">{addr.full_address}</p>
                                            <p className="text-gray-600">{addr.city}, {addr.postal_code}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:sticky lg:top-8 lg:self-start">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                            <div className="flex items-center mb-6">
                                <ShoppingBag className="h-5 w-5 text-indigo-600 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-900">Ringkasan Pesanan</h2>
                            </div>
                            <div className="space-y-4 mb-6">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between py-3 border-b">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl mr-3">
                                                {item.image}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-gray-900">
                                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Layanan Pengiriman</label>
                                <select
                                    onChange={(e) => {
                                        const selected = shippingOptions.find(
                                            (o) => `${o.name}-${o.service}` === e.target.value
                                        );
                                        setSelectedShipping(selected);
                                    }}
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                >
                                    <option value="">-- Pilih Kurir --</option>
                                    {shippingOptions.map((o, idx) => (
                                        <option key={idx} value={`${o.name}-${o.service}`}>
                                            {o.name} ({o.service}) - Rp {o.cost.toLocaleString('id-ID')} - ETD: {o.etd}
                                        </option>
                                    ))}
                                </select>
                                {selectedShipping && (
                                    <p className="mt-2 text-sm text-gray-700">
                                        Ongkir dipilih: Rp {selectedShipping.cost.toLocaleString('id-ID')} (ETD: {selectedShipping.etd})
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="space-y-3 py-4 border-t border-gray-200">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Ongkos Kirim</span>
                                    <span>Rp {dynamicShipping.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                                    <span>Total</span>
                                    <span>Rp {total.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center py-4 bg-gray-50 rounded-lg mb-6">
                                <Lock className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-sm text-gray-600">Pembayaran aman dan terenkripsi</span>
                            </div>
                            <button
                                onClick={submitCheckout}
                                disabled={isProcessing || !selectedShipping}  // Disabled jika belum memilih shipping
                                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${isProcessing || !selectedShipping
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
                                    }`}
                            >
                                {isProcessing ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Memproses...
                                    </div>
                                ) : (
                                    `Bayar Sekarang - Rp ${total.toLocaleString('id-ID')}`
                                )}
                            </button>
                            <div className="mt-4 text-center">
                                <p className="text-xs text-gray-500">
                                    Dengan melakukan pembayaran, Anda menyetujui{' '}
                                    <a href="#" className="text-indigo-600 hover:underline">Syarat & Ketentuan</a>{' '}dan{' '}
                                    <a href="#" className="text-indigo-600 hover:underline">Kebijakan Privasi</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
