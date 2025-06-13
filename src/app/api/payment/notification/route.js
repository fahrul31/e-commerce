// app/api/payment/notification/route.js
import { NextResponse } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";
import { sendPurchaseEmails } from "@/app/utils/email/sendPurchaseEmails";

export async function POST(req) {
    try {
        // Ambil payload yang dikirim oleh Midtrans
        const payload = await req.json();


        // Verifikasi signature dari Midtrans
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        const hash = crypto.createHash("sha512");
        const order_id = payload.order_id;
        const rawSig = payload.reference + payload.status_code + payload.gross_amount + serverKey;
        hash.update(rawSig);
        const expectedSignature = hash.digest("hex");


        //signature valid
        if (payload.signature_key !== expectedSignature) {
            return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 403 });
        }


        // Ambil informasi penting dari notifikasi
        const reference = payload.reference; // referensi pesanan
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

        // Jika berhasil dibayar, ambil data order dan kirim email
        if (finalStatus === "paid") {
            // Ambil data order beserta user dan alamat
            const [orderResult] = await db.query(`
                SELECT
                    o.id AS order_id, o.user_id, o.total_price, o.status, o.created_at, o.updated_at,
                    u.name AS customer_name, u.email, u.phone,
                    a.full_address AS shipping_address
                FROM orders o
                JOIN users u ON o.user_id = u.id
                JOIN addresses a ON o.user_id = a.user_id AND a.is_primary = 1
                WHERE o.id = ?
            `, [order_id]);

            if (orderResult.length === 0) {
                return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
            }

            const order = orderResult[0];

            // Ambil item pesanan
            const [items] = await db.query(`
                SELECT oi.product_id, oi.quantity, oi.price, p.name as product_name
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [order_id]);

            // Kirim email dengan fungsi terpisah
            await sendPurchaseEmails(order, items);
        }


        return NextResponse.json({ success: true, message: "Transaction updated" });
    } catch (error) {
        console.error("Midtrans Notification Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}





