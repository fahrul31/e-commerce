'use client';


import React, { useEffect, useState } from 'react';
import { trackShipment } from '@/app/utils/actions/track';
import Swal from 'sweetalert2';


const TransactionSection = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trackingInfo, setTrackingInfo] = useState(null);
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [showComplaintModal, setShowComplaintModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null); // Untuk menyimpan ID pesanan yang sedang dikomplain
    const [complaintReason, setComplaintReason] = useState(""); // Alasan komplain


    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-700';
            case 'expired':
                return 'bg-red-100 text-red-700';
            case 'cancelled':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-yellow-100 text-yellow-700';
        }
    };


    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await fetch('/api/transactions');
                const data = await res.json();
                if (res.ok && data.success) {
                    setTransactions(data.data);
                }
            } catch (error) {
                console.error('Gagal memuat transaksi:', error);
            } finally {
                setLoading(false);
            }
        };


        fetchTransactions();
    }, []);


    const handleTrack = async (tracking_number, courier, orderId) => {
        try {
            const response = await trackShipment(tracking_number, courier);
            if (response.success) {
                setTrackingInfo({
                    ...response.data,
                    summary: {
                        description: `Pengiriman untuk Order #${orderId}`
                    },
                    delivery_status: {
                        status: response.data.delivery_status.status
                    },
                    manifest: response.data.manifest || []
                });
                setShowTrackingModal(true);
            } else {
                alert("Gagal melacak pengiriman");
            }
        } catch (error) {
            console.error("Tracking error:", error);
            alert("Terjadi kesalahan saat melacak");
        }
    };


    // Handle konfirmasi pesanan diterima
    const handleConfirmReceived = async (orderId) => {
        try {
            const res = await fetch(`/api/orders/${orderId}/confirm-received`, {
                method: 'PATCH',
            });
            const data = await res.json();
            if (res.ok && data.success) {
                Swal.fire("Sukses", "Pesanan telah diterima", "success");
                setTransactions(prevState =>
                    prevState.map(trx =>
                        trx.id === orderId ? { ...trx, status: 'received' } : trx
                    )
                );
            } else {
                Swal.fire("Gagal", "Terjadi kesalahan saat konfirmasi penerimaan", "error");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Gagal", "Terjadi kesalahan", "error");
        }
    };


    // Handle komplain pesanan
    const handleComplain = async () => {
        if (!complaintReason) {
            Swal.fire("Gagal", "Alasan komplain harus diisi", "warning");
            return;
        }


        try {
            const res = await fetch(`/api/orders/${selectedOrderId}/complain`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ complaint_reason: complaintReason })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                Swal.fire("Sukses", "Pesanan telah dikembalikan", "success");
                setTransactions(prevState =>
                    prevState.map(trx =>
                        trx.id === selectedOrderId ? { ...trx, status: 'returned' } : trx
                    )
                );
                setShowComplaintModal(false);
                setComplaintReason(""); // Clear complaint reason
            } else {
                Swal.fire("Gagal", "Terjadi kesalahan saat mengajukan komplain", "error");
            }
        } catch (error) {
            Swal.fire("Gagal", "Terjadi kesalahan", "error");
            console.error(error);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Memuat data...</span>
            </div>
        );
    }


    if (transactions.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-gray-500 text-lg">Belum ada transaksi.</p>
                <p className="text-gray-400 text-sm mt-2">Transaksi Anda akan muncul di sini</p>
            </div>
        );
    }


    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="text-2xl">📦</span>
                        Riwayat Transaksi
                    </h2>
                </div>


                {transactions.map((trx) => (
                    <div key={trx.reference} className="border border-gray-200 rounded-xl shadow-sm p-6 bg-white hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Ref: {trx.reference}</p>
                                <p className="text-xl font-semibold text-gray-800">
                                    Total: Rp {Number(trx.total_price).toLocaleString('id-ID')}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(trx.status)}`}>
                                    {trx.status.toUpperCase()}
                                </span>
                                <div className="mt-2">
                                    {trx.tracking_number && (
                                        <button
                                            onClick={() => handleTrack(trx.tracking_number, trx.courier, trx.order_id)}
                                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Lacak
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>


                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-gray-700 mb-3">Detail Pesanan:</h4>
                            <div className="divide-y divide-gray-200">
                                {trx.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between py-2 text-sm">
                                        <span className="text-gray-700">
                                            {item.name} x{item.quantity}
                                        </span>
                                        <span className="font-medium text-gray-800">
                                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>


                        <div className="flex justify-between text-xs text-gray-500">
                            <p>Dibayar: {trx.paid_at ? new Date(trx.paid_at).toLocaleString('id-ID') : '-'}</p>
                            <p>Metode: {trx.payment_method || '-'}</p>
                        </div>

                        {/* Button for confirming receipt or complaint */}
                        {trx.status === "shipped" && (
                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={() => handleConfirmReceived(trx.order_id)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Konfirmasi Diterima
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedOrderId(trx.order_id);
                                        setShowComplaintModal(true);
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Komplain
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>


            {/* Complaint Modal */}
            {showComplaintModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
                        <h3 className="text-xl font-semibold">Alasan Komplain</h3>
                        <textarea
                            value={complaintReason}
                            onChange={(e) => setComplaintReason(e.target.value)}
                            rows={4}
                            className="w-full border border-gray-300 rounded-md p-2 mt-4"
                            placeholder="Tuliskan alasan komplain..."
                        />
                        <div className="mt-4 flex justify-end gap-3">
                            <button
                                onClick={() => setShowComplaintModal(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleComplain}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Ajukan Komplain
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
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
                            <h4 className="font-semibold text-gray-900 mb-4">Riwayat Perjalanan</h4>
                            <div className="relative">
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                <div className="space-y-4">
                                    {trackingInfo.manifest?.map((item, index) => (
                                        <div key={index} className="relative flex items-start gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index === 0 ? 'bg-green-500' : 'bg-blue-500'} text-white shadow-lg z-10`}>
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
                                                        <span>📅 {item.manifest_date}</span>
                                                        <span>⏰ {item.manifest_time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>


                        {/* Footer */}
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
        </>
    );
};


export default TransactionSection;