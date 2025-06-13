import { NextResponse } from "next/server";
import db from "@/lib/db";
import { sendPurchaseEmails } from "@/app/utils/email/sendPurchaseEmails";


// Fungsi untuk mengambil detail pesanan berdasarkan order_id
export async function POST(request) {
    const { order_id, reference, payment_type } = await request.json();


    try {
        console.log(order_id, reference);


        // Gabungkan query untuk mengambil detail pesanan, user dan shipment dalam satu query
        const query = `
            SELECT
                o.id as order_id, o.user_id, o.total_price, o.status, o.created_at, o.updated_at,
                u.name as customer_name, u.email, u.phone,
                a.full_address as shipping_address
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN addresses a ON o.user_id = a.user_id AND a.is_primary = 1
            WHERE o.id = ?
        `;
        const [orderResult] = await db.query(query, [order_id]);


        if (orderResult.length === 0) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }


        const order = orderResult[0];


        // Update transaction status
        await db.execute(
            `UPDATE transactions
             SET payment_method = ?, status = 'paid', paid_at = NOW()
             WHERE reference = ? AND order_id = ?`,
            [payment_type, reference, order_id]
        );


        // Mengambil item pesanan
        const itemsQuery = `
            SELECT oi.product_id, oi.quantity, oi.price, p.name as product_name
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `;
        const [items] = await db.query(itemsQuery, [order_id]);


        await sendPurchaseEmails(order, items);

        // // Membuat daftar item dalam bentuk string HTML
        // let itemDetails = '';
        // items.forEach(item => {
        //     itemDetails += `
        //         <li><strong>Nama Produk:</strong> ${item.product_name}</li>
        //         <li><strong>Jumlah:</strong> ${item.quantity}</li>
        //         <li><strong>Harga:</strong> Rp ${item.price.toLocaleString('id-ID')}</li>
        //         <br />
        //     `;
        // });


        // // Kirim email setelah berhasil pembelian ke pembeli
        // const buyerMailOptions = {
        //     from: process.env.EMAIL,
        //     to: order.email,
        //     subject: "Pembayaran Berhasil - Terima Kasih atas Pembelian Anda",
        //     html: `
        //         <p>Terima kasih telah melakukan pembelian di toko kami!</p>
        //         <p>Pembayaran Anda untuk transaksi dengan <strong>Order ID: ${order.order_id}</strong> telah berhasil diproses.</p>
        //         <p>Berikut adalah rincian pesanan Anda:</p>
        //         <ul>
        //             ${itemDetails}
        //         </ul>
        //         <p><strong>Total Pembayaran:</strong> Rp ${order.total_price.toLocaleString('id-ID')}</p>
        //         <p>Pesanan Anda akan segera diproses dan dikirimkan kepada Anda. Terima kasih atas kepercayaan Anda!</p>
        //         <p>Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami.</p>
        //         <p>Terima kasih atas dukungannya!</p>
        //     `,
        // };


        // // Email ke admin
        // const adminMailOptions = {
        //     from: process.env.EMAIL,
        //     to: process.env.ADMIN_EMAIL,
        //     subject: `Pesanan Baru - Order ID: ${order.order_id}`,
        //     html: `
        //         <p>Pesanan baru telah dibuat oleh <strong>${order.customer_name}</strong> (${order.email})</p>
        //         <p><strong>Order ID:</strong> ${order.order_id}</p>
        //         <p><strong>Alamat Pengiriman:</strong> ${order.shipping_address}</p>
        //         <p><strong>Kontak:</strong> ${order.phone}</p>
        //         <p>Detail Pesanan:</p>
        //         <ul>
        //             ${itemDetails}
        //         </ul>
        //         <p><strong>Total:</strong> Rp ${order.total_price.toLocaleString('id-ID')}</p>
        //     `,
        // };


        // // Kirim email ke pembeli
        // await transporter.sendMail(buyerMailOptions);


        // // Kirim email ke admin
        // await transporter.sendMail(adminMailOptions);


        return NextResponse.json({
            success: true,
            message: 'Transaction successfully updated and email sent',
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch order details' },
            { status: 500 }
        );
    }
}




