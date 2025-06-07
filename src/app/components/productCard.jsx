import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { addToCart } from "@/app/utils/actions/cart";
import Swal from 'sweetalert2';

export default function ProductCard({ product, viewMode = "grid", categories = [] }) {
    const [quantity, setQuantity] = useState(1);

    if (!product) return null;

    const cat = categories.find(c => c.id === product.category_id);
    const categoryName = cat ? cat.name : "Tanpa Kategori";

    const handleAddToCart = async (e) => {
        e.preventDefault();
        console.log("Added to cart:", {
            productId: product.id,
            quantity
        });
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

    const handleQuantityChange = (e) => {
        const value = Math.max(1, parseInt(e.target.value) || 1);
        setQuantity(value);
    };

    if (viewMode === 'list') {
        return (
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 overflow-hidden">
                <div className="flex gap-4 p-4">
                    {/* Image */}
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                                📦
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 justify-between">
                        <div className="flex flex-col justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                                    {product.name}
                                </h3>
                                <p className="text-xs text-gray-500 mb-2">{categoryName}</p>
                            </div>


                            <div className="flex items-center justify-between gap-2">
                                <div className="font-semibold text-blue-600">{new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0
                                }).format(product.price)}</div>
                                <input
                                    type="number"
                                    min={1}
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    className="w-16 text-sm border border-gray-300 rounded-md px-2 py-1"
                                />
                            </div>

                        </div>

                        {/* Actions */}
                        <div className="flex flex-col justify-between items-end">
                            <button
                                onClick={handleAddToCart}
                                className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors"
                            >
                                Beli
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Grid View
    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden group">
            {/* Image Container */}
            <div className="relative">
                <div className="aspect-square bg-gray-100 overflow-hidden">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                            📦
                        </div>
                    )}
                </div>

                {/* Featured Badge */}
                {product.featured === 1 && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-md">
                        ⭐ Unggulan
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="mb-2">
                    <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                        {product.name}
                    </h3>
                    <p className="text-xs text-gray-500">{categoryName}</p>
                </div>

                {/* Price */}
                <div className="font-semibold text-blue-600 mb-3">
                    {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0
                    }).format(product.price)}
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="w-16 text-sm border border-gray-300 rounded-md px-2 py-1"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <a
                        href={`/products/${product.id}`}
                        className="flex-1 text-center py-2 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Detail
                    </a>
                    <button
                        onClick={handleAddToCart}
                        className="flex-1 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                    >
                        <ShoppingCart size={14} />
                        Beli
                    </button>
                </div>
            </div>
        </div>
    );
}