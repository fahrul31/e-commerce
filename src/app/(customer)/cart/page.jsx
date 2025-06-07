"use client";
import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Heart, ArrowLeft, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { getCartItems, updateCartQuantity, removeCartItem } from './action';
export default function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        async function load() {
            const res = await getCartItems();
            if (res.success) {
                setCartItems(res.data);
                setSelectedItems(res.data.map(item => item.product_id));
            } else {
                console.error(res.message);
            }
        }
        load();
    }, []);

    const toggleItemSelection = (id) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleUpdateQuantity = async (product_id, newQty) => {
        if (newQty < 1) return;
        const res = await updateCartQuantity(product_id, newQty);
        if (res.success) {
            setCartItems(cartItems.map(item =>
                item.product_id === product_id ? { ...item, quantity: newQty } : item
            ));
        } else {
            console.error(res.message);
        }
    };

    const handleRemoveItem = async (product_id) => {
        const res = await removeCartItem(product_id);
        if (res.success) {
            setCartItems(cartItems.filter(item => item.product_id !== product_id));
            setSelectedItems(selectedItems.filter(i => i !== product_id));
        } else {
            console.error(res.message);
        }
    };

    const handleRemoveSelectedItems = async () => {
        if (selectedItems.length === 0) return;

        try {
            // Lakukan request DELETE untuk semua selected items secara paralel
            await Promise.all(
                selectedItems.map(id => removeCartItem(id))
            );

            // Filter item yang tersisa di cart
            const updatedCart = cartItems.filter(item => !selectedItems.includes(item.product_id));

            setCartItems(updatedCart);
            setSelectedItems([]);
        } catch (error) {
            console.error("Gagal menghapus item terpilih:", error);
        }
    };


    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    console.log(subtotal);
    const total = subtotal;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="flex items-center">
                                <ShoppingCart className="h-6 w-6 text-indigo-600 mr-5" />
                                <h1 className="text-2xl font-bold text-gray-900">Keranjang Belanja</h1>
                                <span className="ml-2 bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                    {cartItems.length} item
                                </span>
                            </div>
                        </div>
                        <button onClick={() => {
                            window.location.href = "/index";
                        }} className="text-indigo-600 hover:text-indigo-700 font-medium">
                            Lanjut Belanja
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Select All */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-end">
                                <button
                                    onClick={handleRemoveSelectedItems}
                                    disabled={selectedItems.length === 0}
                                    className="text-red-600 hover:text-red-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                    Hapus Terpilih
                                </button>
                            </div>
                        </div>

                        {/* Cart Items List */}
                        {cartItems.map(item => (
                            <div key={item.product_id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-start space-x-4">
                                        {/* Checkbox */}
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item.product_id)}
                                            onChange={() => toggleItemSelection(item.product_id)}
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 mt-2"
                                        />

                                        {/* Product Image */}
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                                            <img src={item.image_url} alt={item.name} className="object-cover w-full h-full" />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
                                                    <p className="text-sm text-gray-500">Stock: Tersedia</p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveItem(item.product_id)}
                                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            {/* Price & Quantity */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xl font-bold text-gray-900">
                                                            Rp {item.price.toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                        className="p-2 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="px-4 py-2 text-center min-w-[3rem] font-medium">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                                                        className="p-2 hover:bg-gray-100"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {cartItems.length === 0 && (
                            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                                <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Keranjang belanja kosong</h3>
                                <p className="text-gray-500 mb-6">Ayo mulai belanja!</p>
                                <button
                                    onClick={() => {
                                        window.location.href = "/index";
                                    }}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                                    Mulai Belanja
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:sticky lg:top-32 lg:self-start">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900">Ringkasan Belanja</h2>

                            {/* Price Breakdown */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                                </div>

                                <hr className="border-gray-200" />
                                <div className="flex justify-between text-xl font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>Rp {total.toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <div className="flex items-center text-sm text-gray-700">
                                    <ShieldCheck className="h-4 w-4 text-green-500 mr-2" />
                                    <span>Jaminan produk original</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-700">
                                    <Truck className="h-4 w-4 text-blue-500 mr-2" />
                                    <span>Gratis ongkir minimal Rp 500K</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-700">
                                    <RotateCcw className="h-4 w-4 text-orange-500 mr-2" />
                                    <span>Mudah return dalam 7 hari</span>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={() => {
                                    if (cartItems.length > 0) {
                                        window.location.href = "/checkout";
                                    }
                                }}
                                disabled={cartItems.length === 0}
                                className={`w-full py-4 bg-gradient-to-r text-white font-semibold rounded-xl transition-all duration-200 transform shadow-lg ${cartItems.length === 0
                                    ? 'from-gray-400 to-gray-400 cursor-not-allowed'
                                    : 'from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-[1.02] hover:shadow-xl'
                                    }`}
                            >
                                Checkout
                            </button>


                            <p className="text-xs text-gray-500 text-center">
                                Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}