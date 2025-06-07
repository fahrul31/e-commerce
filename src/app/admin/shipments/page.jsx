"use client";
import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import Swal from "sweetalert2";
import * as shipmentActions from "./actions";
import Pagination from "../../components/pagination";

export default function ShipmentsPage() {
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        count: 0,
        currentPage: 1,
        nextPage: null,
        previousPage: null,
    });
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [trackingInfo, setTrackingInfo] = useState(null);
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const limit = 10;

    const fetchShipments = async (page = 1) => {
        setLoading(true);
        try {
            const response = await shipmentActions.fetchShipments(page, limit);
            if (response.success) {
                setShipments(response.data.orders);
                setPagination(response.data.paginationInfo);
            } else {
                alert("Gagal memuat pengiriman");
            }
        } catch (error) {
            alert("Gagal memuat pengiriman");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetails = async (orderId) => {
        setLoading(true);
        try {
            const response = await shipmentActions.fetchOrderDetails(orderId);
            if (response.success) {
                setOrderDetails(response.data);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Gagal memuat detail pesanan",
                    text: response.message,
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Gagal memuat detail pesanan",
                text: "Terjadi kesalahan saat mengambil detail pesanan",
            });
        } finally {
            setLoading(false);
        }
    };

    const trackShipment = async (trackingNumber, courier) => {
        setLoading(true);
        try {
            const response = await shipmentActions.trackShipment(trackingNumber, courier);
            if (response.success) {
                setTrackingInfo(response.data);
                setExpandedOrderId(null);
                setShowTrackingModal(true);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Gagal melacak pengiriman",
                    text: response.message,
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Gagal melacak pengiriman",
                text: "Terjadi kesalahan saat melacak pengiriman",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShipments();
    }, []);

    const handlePageChange = (page) => {
        fetchShipments(page);
    };

    const toggleShipmentDetails = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
        if (expandedOrderId !== orderId) {
            fetchOrderDetails(orderId);
        }
    };

    const getShipmentStatusBadge = (status) => {
        const statusClasses = {
            'pending': "bg-yellow-100 text-yellow-800",
            'shipped': "bg-blue-100 text-blue-800",
            'in_transit': "bg-purple-100 text-purple-800",
            'delivered': "bg-green-100 text-green-800",
            'cancelled': "bg-red-100 text-red-800"
        };
        return `px-3 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
    };

    const getCourierIcon = (courier) => {
        const courierName = courier?.toLowerCase();
        if (courierName?.includes('jne')) return '📦';
        if (courierName?.includes('pos')) return '📮';
        if (courierName?.includes('tiki')) return '🚚';
        if (courierName?.includes('jnt')) return '📫';
        return '🚛';
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500 p-2 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Pengiriman</h1>
                </div>

                {loading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                        <span className="ml-2 text-gray-600">Memuat data...</span>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {shipments.map((shipment, index) => (
                        <div key={shipment.id} className={`${index !== shipments.length - 1 ? 'border-b border-gray-200' : ''}`}>
                            <div className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">{getCourierIcon(shipment.courier)}</span>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{shipment.courier}</h3>
                                                <p className="text-sm text-gray-500">#{shipment.tracking_number}</p>
                                            </div>
                                            <span className={getShipmentStatusBadge(shipment.shipment_status)}>
                                                {shipment.shipment_status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium text-green-600">Rp {shipment.total_price?.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => toggleShipmentDetails(shipment.id)}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Detail
                                        </button>
                                        <button
                                            onClick={() => trackShipment(shipment.tracking_number, shipment.courier)}
                                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Lacak
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {shipments.length === 0 && !loading && (
                        <div className="p-8 text-center text-gray-500">
                            <div className="text-6xl mb-4">📦</div>
                            <p className="text-lg">Tidak ada pengiriman ditemukan</p>
                        </div>
                    )}
                </div>

                <Pagination
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    limit={limit}
                />
            </div>

            {/* Modal Detail Pesanan */}
            {expandedOrderId && orderDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Detail Pesanan</h3>
                            </div>
                            <button
                                onClick={() => setExpandedOrderId(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Info Transaksi */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    Info Transaksi
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Referensi:</span>
                                        <p className="font-mono text-xs mt-1 bg-white px-2 py-1 rounded">{orderDetails.transaction?.transaction_reference}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Status:</span>
                                        <p className="font-medium mt-1">{orderDetails.transaction?.transaction_status}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Info Pengiriman */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    Info Pengiriman
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Kurir:</span>
                                        <p className="font-medium mt-1 flex items-center gap-1">
                                            {getCourierIcon(orderDetails.shipment?.courier)}
                                            {orderDetails.shipment?.courier}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Status:</span>
                                        <p className="mt-1">
                                            <span className={getShipmentStatusBadge(orderDetails.shipment?.shipment_status)}>
                                                {orderDetails.shipment?.shipment_status}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Items Pesanan */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Items Pesanan
                                </h4>
                                <div className="space-y-2">
                                    {orderDetails.items?.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{item.product_name}</p>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold text-gray-900">Rp {item.price?.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end p-6 border-t border-gray-200">
                            <button
                                onClick={() => setExpandedOrderId(null)}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tracking */}
            {showTrackingModal && trackingInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-xl">
                            <div className="flex items-center gap-3">
                                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">Pelacakan Paket</h3>
                                    <p className="text-sm opacity-90">{trackingInfo.summary?.description}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowTrackingModal(false)}
                                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Status Card */}
                        <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50">
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-3 rounded-full">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">Status Terkini</h4>
                                        <p className="text-green-600 font-medium">{trackingInfo.delivery_status?.status}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="p-6">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Riwayat Perjalanan
                            </h4>
                            <div className="relative">
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                <div className="space-y-4">
                                    {trackingInfo.manifest?.map((item, index) => (
                                        <div key={index} className="relative flex items-start gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index === 0 ? 'bg-green-500' : 'bg-blue-500'
                                                } text-white shadow-lg z-10`}>
                                                {index === 0 ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <span className="text-xs font-bold">{index + 1}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                                    <p className="font-medium text-gray-900 mb-1">{item.manifest_description}</p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            {item.manifest_date}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {item.manifest_time}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            <button
                                onClick={() => setShowTrackingModal(false)}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}