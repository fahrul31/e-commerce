"use client";

import { useEffect, useState } from "react";

export default function TransactionHistoryPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/transactions");
                const data = await res.json();
                console.log(data);
                if (res.ok && data.success) {
                    setTransactions(data.data);
                } else {
                    console.error(data.message);
                }
            } catch (err) {
                console.error("Gagal memuat transaksi:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "paid": return "bg-green-100 text-green-700";
            case "expired": return "bg-red-100 text-red-700";
            case "cancelled": return "bg-gray-100 text-gray-700";
            default: return "bg-yellow-100 text-yellow-700";
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Riwayat Transaksi</h1>
            {loading ? (
                <p className="text-gray-600">Memuat data...</p>
            ) : transactions.length === 0 ? (
                <p className="text-gray-500">Belum ada transaksi.</p>
            ) : (
                <div className="space-y-6">
                    {transactions.map((trx) => (
                        <div
                            key={trx.reference}
                            className="border border-gray-200 rounded-xl shadow-sm p-5 bg-white hover:shadow-md transition"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="text-sm text-gray-400">Ref: {trx.reference}</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        Total: Rp {Number(trx.total_price).toLocaleString("id-ID")}
                                    </p>
                                </div>
                                <div>
                                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(trx.status)}`}>
                                        {trx.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {trx.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between py-2 text-sm text-gray-700">
                                        <span>{item.name} x{item.quantity}</span>
                                        <span>Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="text-xs text-right text-gray-500 mt-3">
                                Dibayar: {trx.paid_at ? new Date(trx.paid_at).toLocaleString("id-ID") : '-'}
                                <br />Metode: {trx.payment_method || '-'}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
