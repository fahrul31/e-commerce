// app/admin/products/page.jsx

"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/app/components/productCard";
import CategoryFilter from "@/app/components/CategoryFilter";
import SearchBar from "@/app/components/searchBar";
import SortDropdown from "@/app/components/sortDropdown";
import Pagination from "@/app/components/pagination";
import { fetchProducts, fetchCategories } from "./actions";

export default function ProductListing() {
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);

    // Data state
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState(null);
    const [filterCategory, setFilterCategory] = useState("");
    const [pagination, setPagination] = useState({ count: 0, currentPage: 1, nextPage: null, previousPage: null });
    const [loading, setLoading] = useState(false);
    const limit = 5;

    const loadCategories = async () => {
        try {
            const cats = await fetchCategories();
            setCategories(cats.data);
        } catch (error) {
            console.error("Gagal memuat kategori", error);
        }
    };

    const loadProducts = async (page = 1) => {
        setLoading(true);
        const response = await fetchProducts(page, limit, searchTerm, filterCategory, sortOrder);
        if (response.success) {
            setProducts(response.data.result);
            setPagination(response.data.paginationInfo);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadCategories();
        loadProducts(1);
    }, []);

    useEffect(() => {
        loadProducts(1);
    }, [searchTerm, filterCategory, sortOrder]);

    const formatPrice = (price) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header & Breadcrumb */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold">Semua Produk</h1>
                        <p className="text-gray-600 mt-1">Menampilkan {products.length} dari {pagination.count} produk</p>
                    </div>

                    {/* View Mode & Filter Toggle */}
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden px-4 py-2 bg-blue-600 text-white rounded-md">
                            Filter & Urutkan
                        </button>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button onClick={() => setViewMode('grid')} className={`${viewMode === 'grid' ? 'bg-white shadow' : 'text-gray-600'} px-3 py-2 rounded-md`}>Grid</button>
                            <button onClick={() => setViewMode('list')} className={`${viewMode === 'list' ? 'bg-white shadow' : 'text-gray-600'} px-3 py-2 rounded-md`}>List</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Filters */}
                <div className={`${showFilters ? 'block' : 'hidden lg:block'} bg-white p-4 rounded-lg shadow mb-6`}>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <SearchBar value={searchTerm} onChange={setSearchTerm} />
                        <CategoryFilter categories={categories} value={filterCategory} onChange={setFilterCategory} />
                        <SortDropdown value={sortOrder ?? ''} onChange={setSortOrder} />
                        <div></div>
                    </div>
                </div>

                {/* Products */}
                <div className="bg-white rounded-lg shadow p-6">
                    {loading
                        ? <p>Memuat produk...</p>
                        : <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                            {products.map(p => (
                                <div key={p.id} className="transform hover:scale-105 transition">
                                    <ProductCard product={p} viewMode={viewMode} categories={categories} />
                                </div>
                            ))}
                        </div>
                    }
                </div>

                {/* Pagination */}
                <div className="mt-8">
                    <Pagination pagination={pagination} onPageChange={loadProducts} limit={limit} />
                </div>

                {/* Recently Viewed (optional) */}
            </div>
        </div>
    );
}
