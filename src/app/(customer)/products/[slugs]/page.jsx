"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { addToCart } from "@/app/utils/actions/cart"; // Impor fungsi untuk menambahkan ke keranjang
import Swal from "sweetalert2";
import { fetchProductDetail } from "./action";


export default function ProductDetail() {
    const { slugs } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1); // State untuk jumlah produk yang akan dibeli


    // Fungsi untuk memformat harga
    const formatPrice = (price) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);


    // Load product data
    const loadProduct = async () => {
        try {
            setLoading(true);
            const response = await fetchProductDetail(slugs);
            if (response.success) {
                setProduct(response.data);
                console.log(response.data);
            } else {
                setError(response.message);
                console.log(response.message);
            }
        } catch (error) {
            setError("Gagal memuat detail produk");
            console.error("Error loading product:", error);
        } finally {
            setLoading(false);
        }
    };


    // Menangani penambahan ke keranjang
    const handleAddToCart = async (e) => {
        e.preventDefault();
        console.log("Added to cart:", { productId: product.id, quantity });
        const response = await addToCart(product.id, quantity);
        if (response.success) {
            Swal.fire("Ditambahkan!", "Produk telah ditambahkan ke keranjang", "success");
        } else {
            console.log(response);
            if (response.status === 403) {
                Swal.fire("Gagal", "Mohon login terlebih dahulu sebelum melakukan pemesanan", "error");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            } else {
                Swal.fire("Gagal", response.message, "error");
            }
        }
    };


    // Mengubah kuantitas produk yang akan dibeli
    const handleQuantityChange = (e) => {
        const value = Math.max(1, parseInt(e.target.value) || 1); // Menghindari kuantitas negatif atau nol
        setQuantity(value);
    };


    const incrementQuantity = () => {
        setQuantity((prevQuantity) => prevQuantity + 1); // Meningkatkan kuantitas
    };


    const decrementQuantity = () => {
        setQuantity((prevQuantity) => Math.max(1, prevQuantity - 1)); // Mengurangi kuantitas tapi tidak kurang dari 1
    };


    useEffect(() => {
        if (slugs) {
            loadProduct();
        }
    }, [slugs]);


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }


    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Produk Tidak Ditemukan</h2>
                    <p className="text-gray-600">{error || "Produk yang Anda cari tidak ditemukan"}</p>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <nav className="text-sm text-gray-500">
                        <span className="hover:text-gray-700 cursor-pointer">Home</span> /
                        <span className="hover:text-gray-700 cursor-pointer"> Produk</span> /
                        <span className="hover:text-gray-700 cursor-pointer"> {product.category_name || 'Kategori'}</span> /
                        <span className="text-gray-900 font-medium"> {product.name}</span>
                    </nav>
                </div>
            </div>


            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-2 gap-12 mb-12">
                    {/* Product Images */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden group">
                            <div className="aspect-square relative overflow-hidden">
                                <img
                                    src={product.image_url || "/placeholder.jpg"}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        </div>
                    </div>


                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Title & Rating */}
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-gray-600">(4.8) · 5 ulasan</span>
                                <span className="text-green-600 font-medium">✓ Tersedia</span>
                            </div>
                        </div>


                        {/* Price */}
                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-bold text-gray-900">
                                {formatPrice(product.price)}
                            </span>
                            {product.discount_percentage > 0 && (
                                <>
                                    <span className="text-xl text-gray-400 line-through">
                                        {formatPrice(product.original_price)}
                                    </span>
                                    <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded">
                                        Hemat {product.discount_percentage}%
                                    </span>
                                </>
                            )}
                        </div>


                        {/* Description */}
                        <div className="text-gray-600 leading-relaxed">
                            <p>{product.description || "Tidak ada deskripsi produk"}</p>
                        </div>


                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                {/* Tombol untuk mengurangi kuantitas */}
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 bg-gray-200 rounded-full flex justify-center items-center text-xl text-gray-600"
                                >
                                    -
                                </button>


                                {/* Input untuk mengatur jumlah */}
                                <input
                                    type="number"
                                    min={1}
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    className="w-16 text-center text-lg border border-gray-300 rounded-md px-2 py-1"
                                />


                                {/* Tombol untuk menambah kuantitas */}
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 bg-gray-200 rounded-full flex justify-center items-center text-xl text-gray-600"
                                >
                                    +
                                </button>
                            </div>


                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                🛒 Tambah ke Keranjang
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}