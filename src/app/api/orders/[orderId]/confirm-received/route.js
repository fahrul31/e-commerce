import { NextResponse } from "next/server";
import db from "@/lib/db";
import transporter from "@/lib/nodemailer";
import { getToken } from "next-auth/jwt";


// Endpoint untuk mengonfirmasi pesanan diterima
export async function PATCH(request, { params }) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });


    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized: token diperlukan" },
            { status: 403 }
        );
    }


    const orderId = params.orderId;


    try {
        const updateQuery = `
            UPDATE orders
            SET status = 'success'
            WHERE id = ?
        `;
        const [result] = await db.query(updateQuery, [orderId]);


        // Query untuk mendapatkan informasi pesanan
        const orderQuery = `
            SELECT o.id as order_id, o.user_id, o.total_price, o.status, o.created_at, o.updated_at,
                u.name as customer_name, u.email, u.phone, a.full_address as shipping_address
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN addresses a ON o.user_id = a.user_id AND a.is_primary = 1
            WHERE o.id = ?
        `;
        const [orderDetails] = await db.query(orderQuery, [orderId]);


        if (orderDetails.length === 0) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }


        const order = orderDetails[0];
        const itemDetails = await getItemDetails(orderId);


        // Email ke admin setelah pesanan diterima
        const adminMailOptions = {
            from: process.env.EMAIL,
            to: process.env.ADMIN_EMAIL,
            subject: `Pesanan telah sampai ke tujuan - Order ID: ${orderId}`,
            html: `
                <p>Pesanan dengan Order ID: <strong>${orderId}</strong> telah diterima oleh pembeli <strong>${order.customer_name}</strong> (${order.email})</p>
                <p><strong>Alamat Pengiriman:</strong> ${order.shipping_address}</p>
                <p><strong>Kontak:</strong> ${order.phone}</p>
                <p>Detail Pesanan:</p>
                <ul>
                    ${itemDetails}
                </ul>
                <p><strong>Total Pembayaran:</strong> Rp ${order.total_price.toLocaleString('id-ID')}</p>
            `,
        };


        // Kirim email ke admin
        await transporter.sendMail(adminMailOptions);


        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }


        return NextResponse.json({
            success: true,
            message: "Pesanan telah diterima dan status diubah menjadi 'received'",
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        return NextResponse.json({ success: false, message: "Failed to update order status" }, { status: 500 });
    }
}


// Fungsi untuk mendapatkan detail item dari pesanan
async function getItemDetails(orderId) {
    const itemsQuery = `
        SELECT oi.product_id, oi.quantity, oi.price, p.name as product_name
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
    `;
    const [items] = await db.query(itemsQuery, [orderId]);


    let itemDetails = '';
    items.forEach(item => {
        itemDetails += `
            <li><strong>Nama Produk:</strong> ${item.product_name}</li>
            <li><strong>Jumlah:</strong> ${item.quantity}</li>
            <li><strong>Harga:</strong> Rp ${item.price.toLocaleString('id-ID')}</li>
            <br />
        `;
    });
    return itemDetails;
}






