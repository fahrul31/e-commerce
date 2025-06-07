// app/api/transactions/detail/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getToken } from "next-auth/jwt";

export async function GET(request) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized: token diperlukan" },
            { status: 403 }
        );
    }
    try {
        const user_id = token.id;
        const [rows] = await db.query(`
             SELECT 
                t.reference, 
                t.payment_method, 
                t.paid_at, 
                o.status,
                o.total_price, 
                o.id AS order_id,
                s.reference AS tracking_number,
                s.courier
            FROM transactions t
            JOIN orders o ON t.order_id = o.id
            LEFT JOIN shipments s ON s.order_id = o.id
            WHERE o.user_id = ?
            ORDER BY t.created_at DESC
            `, [user_id]);

        const detailed = await Promise.all(rows.map(async (trx) => {
            const [items] = await db.query(`
                SELECT p.name, oi.quantity, oi.price
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [trx.order_id]);

            return { ...trx, items };
        }));

        return NextResponse.json({ success: true, data: detailed });
    } catch (err) {
        console.error("Transaction detail error:", err);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
