import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getToken } from "next-auth/jwt";

// Endpoint untuk mengambil detail pesanan berdasarkan order_id
export async function GET(request, { params }) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized: token diperlukan" },
            { status: 403 }
        );
    }

    const orderId = params.orderId;

    if (!orderId) {
        return NextResponse.json(
            { success: false, message: "Order ID is missing" },
            { status: 400 }
        );
    }

    try {
        const orderQuery = `
            SELECT o.id, o.user_id, o.total_price, o.status, o.created_at, o.updated_at,
                   u.name as customer_name, u.email, u.phone
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `;
        const [orderResult] = await db.query(orderQuery, [orderId]);

        if (orderResult.length === 0) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        const order = orderResult[0];

        // Mengambil item pesanan
        const itemsQuery = `
            SELECT oi.product_id, oi.quantity, oi.price, p.name as product_name
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `;
        const [items] = await db.query(itemsQuery, [orderId]);

        // Mengambil data pengiriman
        const shipmentQuery = `
            SELECT s.reference as tracking_number, s.status as shipment_status, s.courier
            FROM shipments s
            WHERE s.order_id = ?
        `;
        const [shipment] = await db.query(shipmentQuery, [orderId]);

        // Mengambil data transaksi
        const transactionQuery = `
            SELECT t.reference as transaction_reference, t.status as transaction_status
            FROM transactions t
            WHERE t.order_id = ?
        `;
        const [transaction] = await db.query(transactionQuery, [orderId]);

        return NextResponse.json({
            success: true,
            data: {
                order,
                items,
                shipment: shipment[0],
                transaction: transaction[0],
            },
        });
    } catch (error) {
        console.error("Error fetching order details:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch order details" },
            { status: 500 }
        );
    }
}

//Komplain