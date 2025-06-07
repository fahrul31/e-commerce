"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import * as orderActions from "./actions";
import Pagination from "../../components/pagination";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        count: 0,
        currentPage: 1,
        nextPage: null,
        previousPage: null,
    });
    const [search, setSearch] = useState("");
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [trackingNumber, setTrackingNumber] = useState("");
    const limit = 10;

    const isTrackingNumberValid = trackingNumber.trim() !== "";

    const fetchOrders = async (page = 1, searchQuery = "") => {
        setLoading(true);
        try {
            const response = await orderActions.fetchOrders(page, limit, searchQuery);
            if (response.success) {
                setOrders(response.data.result);
                setPagination(response.data.paginationInfo);
            } else {
                alert("Gagal memuat pesanan");
            }
        } catch (error) {
            alert("Gagal memuat pesanan");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const onStatusUpdate = async (orderId, trackingNumber) => {
        setLoading(true);
        try {
            const response = await orderActions.updateOrderWithTracking(orderId, trackingNumber);
            if (response.success) {
                Swal.fire({
                    icon: "success",
                    title: response.message || "Pesanan Dikirim",
                    showConfirmButton: false,
                    timer: 1500,
                });
                fetchOrders(pagination.currentPage, search);
                setTrackingNumber("");
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Gagal memperbarui status",
                    text: response.message || "Terjadi kesalahan",
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Gagal memperbarui status",
                text: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchOrders(page, search);
    };

    const toggleOrderDetails = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchOrders(1, search);
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            pending: "bg-yellow-100 text-yellow-800",
            received: "bg-blue-100 text-blue-800",
            shipped: "bg-green-100 text-green-800",
            completed: "bg-gray-100 text-gray-800"
        };
        return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">Kelola Pesanan</h1>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama pemesan"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Cari
                    </button>
                </form>

                {/* Loading Spinner */}
                {loading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                        <span className="ml-2 text-gray-600">Memuat data...</span>
                    </div>
                )}

                {/* Orders List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {orders.map((order, index) => (
                        <div key={order.id} className={`${index !== orders.length - 1 ? 'border-b border-gray-200' : ''}`}>
                            {/* Order Header */}
                            <div className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">{order.customer_name}</h3>
                                            <span className={getStatusBadge(order.status)}>{order.status}</span>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm text-gray-600">
                                            <span className="font-medium text-green-600">Rp {order.total_price?.toLocaleString()}</span>
                                            <span>#{order.id}</span>
                                            <span>{order.items?.length || 0} item</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        {/* Action Buttons */}
                                        {order.status === "pending" && (
                                            <button
                                                onClick={() => onStatusUpdate(order.id, "")}
                                                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                            >
                                                Terima
                                            </button>
                                        )}
                                        {order.status === "received" && (
                                            <button
                                                onClick={() => onStatusUpdate(order.id, trackingNumber)}
                                                disabled={!isTrackingNumberValid}
                                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${isTrackingNumberValid ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
                                            >
                                                Kirim
                                            </button>
                                        )}

                                        {/* Toggle Details Button */}
                                        <button
                                            onClick={() => toggleOrderDetails(order.id)}
                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                                        >
                                            {expandedOrderId === order.id ? (
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                    Tutup
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                    Detail
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Expandable Details */}
                            {expandedOrderId === order.id && (
                                <div className="px-4 pb-4 bg-gray-50 border-t border-gray-200">
                                    <div className="grid md:grid-cols-2 gap-6 pt-4">
                                        {/* Order Items */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Item Pesanan</h4>
                                            <div className="space-y-2">
                                                {order.items?.map((item, index) => (
                                                    <div key={index} className="flex justify-between items-center py-2 px-3 bg-white text-black rounded border text-sm">
                                                        <div className="flex-1">
                                                            <span className="font-medium ">{item.product_name}</span>
                                                            <span className="text-gray-500 ml-2">x{item.quantity}</span>
                                                        </div>
                                                        <span className="font-medium text-gray-900">Rp {item.price?.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Transaction & Tracking */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Info Transaksi</h4>
                                            <div className="space-y-2 text-sm ">
                                                <div className="flex justify-between py-1 text-black">
                                                    <span className="text-gray-600">Referensi:</span>
                                                    <span className="font-mono text-xs">{order.transaction_reference}</span>
                                                </div>
                                                <div className="flex justify-between py-1 text-black">
                                                    <span className="text-gray-600">Status Transaksi:</span>
                                                    <span className="font-medium">{order.transaction_status}</span>
                                                </div>

                                                {/* Tracking Number Input */}
                                                {order.status === "received" && (
                                                    <div className="mt-4 p-3 bg-blue-50 rounded border">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Resi:</label>
                                                        <input
                                                            type="text"
                                                            value={trackingNumber}
                                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                                            placeholder="Masukkan nomor resi"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {orders.length === 0 && !loading && (
                        <div className="p-8 text-center text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p>Tidak ada pesanan ditemukan</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <Pagination
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    limit={limit}
                />
            </div>
        </AdminLayout>
    );
}