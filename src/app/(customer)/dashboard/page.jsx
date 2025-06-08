"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/header";
import { fetchProducts, fetchCategories } from "./actions";
import ProductCard from "@/app/components/productCard";

export default function Home() {
    // Data state
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [loading, setLoading] = useState(false);
    const limit = 10;
    // Load categories
    const loadCategories = async () => {
        try {
            const cats = await fetchCategories();
            setCategories(cats.data);
        } catch (error) {
            console.error("Gagal memuat kategori", error);
        }
    };

    // Load products with filters and pagination
    const loadProducts = async (page = 1) => {
        setLoading(true);
        try {
            // Find the selected category ID from categories array
            const selectedCat = categories.find(cat => cat.name === selectedCategory);
            const categoryId = selectedCat ? selectedCat.id : "";

            const response = await fetchProducts(page, limit, "", categoryId);
            if (response.success) {
                setProducts(response.data.result);
            }
        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            setLoading(false);
        }
    };


    // Initial load
    useEffect(() => {
        loadCategories();
        loadProducts(1);
    }, []);

    // Reload when filter changes
    useEffect(() => {
        if (categories.length > 0) {
            loadProducts(1);
        }
    }, [selectedCategory, categories]);

    // Format price
    const formatPrice = (price) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <Header />

            <div className="space-y-16 pb-16">
                {/* Hero Section - Updated */}
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-90"></div>

                    {/* Decorative Elements */}
                    <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full animate-bounce delay-500"></div>

                    <div className="relative py-24 px-6 text-center text-white">
                        <div className="max-w-5xl mx-auto">
                            <div className="mb-6">
                                <span className="text-6xl animate-bounce">🛍️</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent leading-tight">
                                Selamat Datang di
                                <br />
                                <span className="text-yellow-300">E-Shop!</span>
                            </h1>

                            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
                                Temukan ribuan produk fashion terbaik dengan kualitas premium dan harga terjangkau.
                                Berbelanja jadi lebih mudah, cepat, dan menyenangkan!
                            </p>
                        </div>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-6 space-y-16">
                    {/* Kategori */}
                    <section className="relative">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                                Telusuri Berdasarkan Kategori
                            </h2>
                            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {categories.map((kategori, index) => (
                                <button
                                    key={kategori.id}
                                    onClick={() =>
                                        setSelectedCategory(kategori.name === selectedCategory ? "" : kategori.name)
                                    }
                                    className={`group relative overflow-hidden px-6 py-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${selectedCategory === kategori.name
                                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl'
                                        : 'bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 text-gray-700 shadow-lg hover:shadow-xl'
                                        }`}
                                    style={{
                                        animationDelay: `${index * 100}ms`
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative z-10">
                                        <div className="text-2xl mb-2">
                                            {kategori.name === 'Baju' && '👕'}
                                            {kategori.name === 'Jaket' && '🧥'}
                                            {kategori.name === 'Celana' && '👖'}
                                            {kategori.name === 'Aksesoris' && '💍'}
                                            {kategori.name === 'Sepatu' && '👟'}
                                            {kategori.name === 'Tas' && '👜'}
                                        </div>
                                        <span className="font-semibold text-sm">{kategori.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                    </section>

                    {/* Produk Unggulan */}
                    <section className="relative">
                        <div className="absolute -top-6 -left-6 w-72 h-72 bg-gradient-to-r from-yellow-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
                        <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>

                        <div className="relative">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                                        <span className="text-4xl animate-bounce">🌟</span>
                                        Produk Unggulan
                                    </h2>
                                    <p className="text-gray-600">Pilihan terbaik yang direkomendasikan khusus untuk Anda</p>
                                </div>
                                <a
                                    href="/products"
                                    className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    <span className="font-semibold">Lihat Semua</span>
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                </a>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {loading ? (
                                    // Loading state
                                    Array(4).fill(0).map((_, index) => (
                                        <div key={index} className="animate-pulse">
                                            <div className="bg-gray-200 rounded-lg aspect-square mb-4"></div>
                                            <div className="space-y-3">
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                                <div className="h-8 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                    ))
                                ) : products.filter(product => product.featured === 1).length === 0 ? (
                                    // Empty state
                                    <div className="col-span-4 text-center py-12">
                                        <div className="text-6xl mb-4">🌟</div>
                                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada produk unggulan</h3>
                                        <p className="text-gray-500">Produk unggulan akan muncul di sini</p>
                                    </div>
                                ) : (
                                    products
                                        .filter(product => product.featured === 1)
                                        .slice(0, 4)
                                        .map((product, index) => (
                                            <div
                                                key={product.id}
                                                className="transform hover:scale-105 transition-all duration-300"
                                                style={{
                                                    animationDelay: `${index * 150}ms`
                                                }}
                                            >
                                                <ProductCard product={product} categories={categories} />
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Produk Terbaru */}
                    <section className="relative">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                                    <span className="text-4xl">🆕</span>
                                    Produk Terbaru
                                </h2>
                                <p className="text-gray-600">Koleksi terbaru yang fresh dari oven untuk gaya Anda</p>
                            </div>
                            <a
                                href="/products"
                                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-full hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                <span className="font-semibold">Lihat Semua</span>
                                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                            </a>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {loading ? (
                                // Loading state
                                Array(4).fill(0).map((_, index) => (
                                    <div key={index} className="animate-pulse">
                                        <div className="bg-gray-200 rounded-lg aspect-square mb-4"></div>
                                        <div className="space-y-3">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-8 bg-gray-200 rounded"></div>
                                        </div>
                                    </div>
                                ))
                            ) : products.filter(product => product.featured !== 1).length === 0 ? (
                                // Empty state
                                <div className="col-span-4 text-center py-12">
                                    <div className="text-6xl mb-4">🆕</div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada produk terbaru</h3>
                                    <p className="text-gray-500">Produk terbaru akan muncul di sini</p>
                                </div>
                            ) : (
                                products
                                    .filter(product => product.featured !== 1)
                                    .slice(0, 4)
                                    .map((product, index) => (
                                        <div
                                            key={product.id}
                                            className="transform hover:scale-105 transition-all duration-300"
                                            style={{
                                                animationDelay: `${index * 150}ms`
                                            }}
                                        >
                                            <ProductCard product={product} categories={categories} />
                                        </div>
                                    ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}