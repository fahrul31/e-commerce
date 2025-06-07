// app/api/payment/notification/route.js
import { NextResponse } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";


export async function POST(req) {
    try {
        // Ambil payload yang dikirim oleh Midtrans
        const payload = await req.json();


        // Verifikasi signature dari Midtrans
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        const hash = crypto.createHash("sha512");
        const rawSig = payload.order_id + payload.status_code + payload.gross_amount + serverKey;
        hash.update(rawSig);
        const expectedSignature = hash.digest("hex");


        //signature valid
        if (payload.signature_key !== expectedSignature) {
            return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 403 });
        }


        // Ambil informasi penting dari notifikasi
        const reference = payload.order_id; // ID pesanan
        const transactionStatus = payload.transaction_status; // Status transaksi dari Midtrans
        const paymentType = payload.payment_type; // Jenis pembayaran (misalnya: credit_card, bank_transfer)
        const paidAt = payload.settlement_time ? new Date(payload.settlement_time) : null;


        // Tentukan status transaksi lokal
        let finalStatus = "pending"; // Status default jika transaksi belum diproses
        if (transactionStatus === "settlement" || transactionStatus === "capture") {
            finalStatus = "paid"; // Jika transaksi berhasil, update status menjadi 'paid'
        } else if (transactionStatus === "expire") {
            finalStatus = "expired"; // Jika transaksi kedaluwarsa
        } else if (transactionStatus === "cancel") {
            finalStatus = "cancelled"; // Jika transaksi dibatalkan
        }


        // Update status transaksi di database
        await db.execute(
            `UPDATE transactions SET status = ?, payment_method = ?, paid_at = ? WHERE reference = ?`,
            [finalStatus, paymentType, paidAt, reference]
        );


        return NextResponse.json({ success: true, message: "Transaction updated" });
    } catch (error) {
        console.error("Midtrans Notification Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}





