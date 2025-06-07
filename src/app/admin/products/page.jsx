"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import Pagination from "@/app/components/pagination";
import { useForm } from "react-hook-form";
import Swal from 'sweetalert2';
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import * as productActions from "./actions";

const productSchema = Yup.object().shape({
    name: Yup.string().required("Nama produk wajib diisi"),
    description: Yup.string().required("Deskripsi wajib diisi"),
    price: Yup.number().required("Harga wajib diisi").min(10000, "Harga minimal 10.000"),
    category_id: Yup.string().required("Kategori wajib dipilih"),
    featured: Yup.boolean(),
    image: Yup.mixed()
        .required()
        .test("fileSize", "Ukuran gambar terlalu besar, max 10MB", (value) => {
            const file = value && value[0];
            console.log(file);
            return !file || file.size <= 10 * 1024 * 1024;
        })
        .test("fileType", "Format gambar tidak didukung", (value) => {
            const file = value && value[0];
            return !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type);
        }),
});

export default function ProductsPage() {
    const [products, setProducts] = useState(null);
    const [categories, setCategories] = useState([]);
    const [formVisible, setFormVisible] = useState(false);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [pagination, setPagination] = useState({
        count: 0,
        currentPage: 1,
        nextPage: null,
        previousPage: null,
    })

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(productSchema),
    });

    const fetchProducts = async (page = 1) => {
        setLoading(true);
        try {
            const response = await productActions.fetchProducts(page, 10, searchTerm, filterCategory);
            if (response.success) {
                setProducts(response.data.result);
                setPagination(response.data.paginationInfo);
            } else {
                alert(response.message || "Gagal memuat produk");
            }
        } catch (error) {
            alert("Gagal memuat produk");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const cats = await productActions.fetchCategories();
            setCategories(cats.data);
        } catch (error) {
            console.error("Gagal memuat kategori", error);
        }
    };

    useEffect(() => {
        fetchProducts(1);
        loadCategories();
    }, []);

    useEffect(() => {
        fetchProducts(1);
    }, [searchTerm, filterCategory]);


    const onSubmit = async (formData) => {
        setLoading(true);
        try {
            let response;

            if (editId) {
                response = await productActions.updateProduct(editId, formData);
            } else {
                response = await productActions.createProduct(formData);
            }

            if (response.success) {
                await Swal.fire({
                    icon: 'success',
                    title: editId ? 'Produk diperbarui' : 'Produk ditambahkan',
                    showConfirmButton: false,
                    timer: 1500
                });

                setFormVisible(false);
                setEditId(null);
                reset();
                await fetchProducts(1);
            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Gagal menyimpan produk',
                    text: response.message || 'Terjadi kesalahan',
                });
            }
        } catch (error) {
            console.error(error);
            await Swal.fire({
                icon: 'error',
                title: 'Gagal menyimpan produk',
                text: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmResult = await Swal.fire({
            title: 'Yakin ingin menghapus produk ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });

        if (!confirmResult.isConfirmed) return;

        setLoading(true);
        try {
            const response = await productActions.deleteProduct(id);

            if (response.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Produk dihapus',
                    showConfirmButton: false,
                    timer: 1500
                });
                await fetchProducts(1);
            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Gagal menghapus produk',
                    text: response.message || 'Terjadi kesalahan',
                });
            }
        } catch (error) {
            console.error(error);
            await Swal.fire({
                icon: 'error',
                title: 'Gagal menghapus produk',
                text: error.message,
            });
        } finally {
            setLoading(false);
        }
    };


    const handleEdit = (product) => {
        setEditId(product.id);
        setFormVisible(true);
        setValue("name", product.name);
        setValue("description", product.description);
        setValue("price", product.price);
        setValue("category_id", product.category_id);
        setValue("featured", product.featured);
        setValue("image_url", product.image_url);
    };

    const formatPrice = (price) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Kelola Produk</h1>
                        <p className="text-gray-600 mt-1">Kelola semua produk e-commerce Anda</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 items-center">
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => {
                                setFormVisible(true);
                                setEditId(null);
                                reset();
                            }}
                            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                        >
                            {/* Plus icon */}
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Tambah Produk
                        </button>
                    </div>
                </div>


                {/* Form Modal */}
                {formVisible && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {editId ? 'Edit Produk' : 'Tambah Produk Baru'}
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Nama Produk */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nama Produk *
                                        </label>
                                        <input
                                            {...register("name")}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Masukkan nama produk"
                                        />
                                        {errors.name && (
                                            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                                        )}
                                    </div>

                                    {/* Harga */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Harga *
                                        </label>
                                        <input
                                            type="number"
                                            {...register("price")}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="10000"
                                        />
                                        {errors.price && (
                                            <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                                        )}
                                    </div>

                                    {/* Kategori */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Kategori *
                                        </label>
                                        <select
                                            {...register("category_id")}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            <option value="">-- Pilih Kategori --</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category_id && (
                                            <p className="text-red-500 text-sm mt-1">{errors.category_id.message}</p>
                                        )}
                                    </div>

                                    {/* Deskripsi */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Deskripsi *
                                        </label>
                                        <textarea
                                            {...register("description")}
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                            placeholder="Masukkan deskripsi produk"
                                        />
                                        {errors.description && (
                                            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                                        )}
                                    </div>

                                    {/* Featured */}
                                    <div>
                                        <label className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                {...register("featured")}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Produk Unggulan</span>
                                        </label>
                                    </div>

                                    {/* Image */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Foto Produk
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            {...register("image")}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                        {errors.image && (
                                            <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>
                                        )}
                                    </div>

                                    {/* Hidden input untuk url image */}
                                    <input
                                        type="hidden"
                                        {...register("image_url")}
                                    />
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormVisible(false);
                                            reset();
                                        }}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                        disabled={loading}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Menyimpan...' : 'Simpan Produk'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Products Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Daftar Produk</h3>
                        <p className="text-gray-600 text-sm">Total: {products?.length ?? 0} produk</p>
                    </div>

                    {loading || products === null ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Memuat data...</span>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada produk</h3>
                            <p className="text-gray-500">Mulai dengan menambahkan produk pertama Anda</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Produk
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Harga
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-16 w-16">
                                                        {product.image_url ? (
                                                            <img
                                                                src={product.image_url}
                                                                alt={product.name}
                                                                className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                                                            />
                                                        ) : (
                                                            <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 max-w-xs truncate">
                                                            {product.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatPrice(product.price)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {product.featured ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        Unggulan
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        Reguler
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                                        disabled={loading}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                        disabled={loading}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Pagination pagination={pagination} onPageChange={productActions.fetchProducts()} limit={10} />
                </div>
            </div>
        </AdminLayout>
    );
}


